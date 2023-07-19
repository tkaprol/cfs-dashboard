import { Row, Col, Card, Select, Form } from 'antd';
import React, { useState, useEffect } from 'react';
import { FullFileBrowser, ChonkyActions, FileHelper } from 'chonky';
import { useKeycloak } from '@react-keycloak/web';
import { getBucketFiles } from '../../services/S3BucketService';
import { getUserWorkflows } from '../../services/dsl_DataService';
import { addAppCustomNotification } from '../../components/NotificationBox';

function FileExplorerComponent() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [folderChain, setFolderChain] = useState([]);
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const { keycloak } = useKeycloak();

  const processFiles = (items) => {
    const processedFiles = [];
    const folderMap = new Map();

    // Add root folder
    folderMap.set('root', {
      id: 'root',
      name: 'Root',
      isDir: true,
      parentId: null,
      childrenIds: [],
    });

    // First pass: Create folder entries
    items.forEach((item) => {
      const pathParts = item.name.split('/');
      let currentPath = '';

      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath += (currentPath ? '/' : '') + pathParts[i];
        if (!folderMap.has(currentPath)) {
          const parentPath = i === 0 ? 'root' : pathParts.slice(0, i).join('/');
          const folder = {
            id: currentPath,
            name: pathParts[i],
            isDir: true,
            parentId: parentPath,
            childrenIds: [],
          };
          folderMap.set(currentPath, folder);

          // Add to parent's childrenIds
          const parentFolder = folderMap.get(parentPath);
          if (parentFolder) {
            parentFolder.childrenIds.push(currentPath);
          }
        }
      }
    });

    // Second pass: Create file entries
    items.forEach((item, index) => {
      const pathParts = item.name.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const parentPath = pathParts.slice(0, -1).join('/') || 'root';

      const fileEntry = {
        id: `file-${index}`,
        name: fileName,
        isDir: false,
        parentId: parentPath,
        filePath: item.name,
        presignedUrl: item.presignedUrl,
      };

      processedFiles.push(fileEntry);

      // Add to parent folder's childrenIds
      const parentFolder = folderMap.get(parentPath);
      if (parentFolder) {
        parentFolder.childrenIds.push(fileEntry.id);
      }
    });

    // Add all folders to processed files
    folderMap.forEach((folder) => {
      processedFiles.push(folder);
    });

    return processedFiles;
  };

  const getCurrentFolderContent = () => {
    return files.filter((file) => file.parentId === currentFolderId);
  };

  const updateFolderChain = (folderId) => {
    const chain = [];
    let currentFolder = files.find((f) => f.id === folderId);

    while (currentFolder) {
      chain.unshift(currentFolder);
      currentFolder = files.find((f) => f.id === currentFolder.parentId);
    }

    setFolderChain(chain);
  };

  const loadFilesForWorkflow = async (workflowId) => {
    try {
      const response = await getBucketFiles(keycloak.token, workflowId);
      const processedFiles = processFiles(response);
      setFiles(processedFiles);
      setCurrentFolderId('root');
      setFolderChain([processedFiles.find((f) => f.id === 'root')]);
    } catch (error) {
      console.error('Error loading files:', error);
      addAppCustomNotification('Error', 'ERROR', 'Failed to load files');
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await getUserWorkflows(keycloak.token);
      const options = response.map((w) => ({
        label: w.name,
        value: w.id,
      }));
      setWorkflowOptions(options);
    } catch (error) {
      console.error('Error loading workflows:', error);
      addAppCustomNotification('Error', 'ERROR', 'Failed to load workflows');
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [keycloak.token]);

  const handleWorkflowChange = (value) => {
    setSelectedWorkflow(value);
    loadFilesForWorkflow(value);
  };

  const downloadFiles = async (filesToDownload) => {
    for (const file of filesToDownload) {
      try {
        const url = `${window.__RUNTIME_CONFIG__.REACT_APP_API_ROOT_URI}/S3/bucket/${selectedWorkflow}/files/preview`;
        const response = await fetch(url, {
          method: 'POST', // Changed to POST
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json', // Specify content type for the body
            'Authorization': `Bearer ${keycloak.token}`,
          },
          body: JSON.stringify({
            // Send the key in the body as JSON
            key: file.filePath,
          }),
        });

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        addAppCustomNotification('Success', 'SUCCESS', `Downloaded ${file.name}`);
      } catch (error) {
        console.error('Download error:', error);
        addAppCustomNotification('Error', 'ERROR', `Failed to download ${file.name}`);
      }
    }
  };

  const fileActions = [ChonkyActions.DownloadFiles, ChonkyActions.OpenFiles, ChonkyActions.EnableListView];

  const handleFileAction = (data) => {
    if (data.action.id === ChonkyActions.DownloadFiles.id) {
      const filesToDownload =
        data.state.selectedFiles.length > 0 ? data.state.selectedFiles : [data.payload.targetFile];
      downloadFiles(filesToDownload);
    } else if (data.action.id === ChonkyActions.OpenFiles.id) {
      const file = data.payload.targetFile;
      if (file && file.isDir) {
        setCurrentFolderId(file.id);
        updateFolderChain(file.id);
      }
    }
  };

  return (
    <Card>
      <Row>
        <Col span={14}>
          <Form.Item label='Workflow' required>
            <Select
              showSearch
              placeholder='Select Workflow'
              value={selectedWorkflow}
              onChange={handleWorkflowChange}
              options={workflowOptions}
              style={{ width: '100%' }}
              filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row style={{ marginTop: 10, marginBottom: 10 }}>
        <Col span={24} style={{ height: 600 }}>
          <FullFileBrowser
            files={getCurrentFolderContent()}
            folderChain={folderChain}
            darkMode={true}
            defaultFileViewActionId={ChonkyActions.EnableListView.id}
            fileActions={fileActions}
            onFileAction={handleFileAction}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default FileExplorerComponent;
