import { Row, Col, Card, Select, Form } from 'antd';
import React, { useState, useEffect } from 'react';
import { getAllS3Bucket, getBucketFiles } from '../../services/S3BucketService';
import { addAppCustomNotification } from '../../components/NotificationBox';
import { FullFileBrowser } from 'chonky';
import { useKeycloak } from '@react-keycloak/web';
import { getUserWorkflows } from '../../services/dsl_DataService';

function MarketPlaceComponent() {
  const [selectedBucketId, SetSelectedBucketId] = useState('fusion-server-bucket');
  const [bucketFiles, setBucketFiles] = useState([]);
  const [rootFolder, setRootFolder] = useState('');
  const [s3_bucket_options, setS3BucketOptions] = useState([]);
  const { keycloak } = useKeycloak();
  const [UserWorkflows, setUserWorkflows] = useState([]);
  const [form] = Form.useForm();
  const fillFileExplorer = (selectedBucketId) => {
    getBucketFiles(keycloak.token, selectedBucketId)
      .then((resp) => {
        var items = resp;
        const files = [];
        const folderChain = [{ id: 'root', name: 'Root(' + selectedBucketId + ')', isDir: true }];
        setRootFolder(folderChain);
        for (let index = 0; index < items.length; index++) {
          var folderNames = items[index].name.split('/');
          var fileName = folderNames[folderNames.length - 1];
          files.push({
            id: index,
            name: fileName,
            //name: items[index].name,
            draggable: true,
            selectable: true,
          });
        }

        setBucketFiles(files);
      })
      .catch((err) => {
        addAppCustomNotification('Dashboard Market Place', 'CRITICAL', 'Encounter an error!');
        console.log(JSON.stringify(err));
      });
  };

  const onChange = (value) => {
    SetSelectedBucketId(value);
    fillFileExplorer(value);
  };
  const onSearch = (value) => {
    console.log('search:', value);
  };

  useEffect(() => {
    getUserWorkflows(keycloak.token)
      .then((response) => {
        let temporary_buckets = [];
        for (const element of response) {
          const bucket = element;
          temporary_buckets.push({
            label: bucket.name,
            value: bucket.id,
          });
        }
        setS3BucketOptions(temporary_buckets);
      })
      .catch((err) => {
        addAppCustomNotification('Dashboard Market Place', 'CRITICAL', 'Encounter an error!');
        console.log(JSON.stringify(err));
      });
  }, []);

  useEffect(() => {
    fillFileExplorer(selectedBucketId);
  }, []);

  return (
    <>
      <Form form={form}></Form>
      <Card>
        <Row>
          <Col span={14}>
            <Form.Item label='Workflow' required>
            <Select
              showSearch
              placeholder='Select Workflow'
              style={{ width: '100%' }}
              optionFilterProp='children'
              onChange={onChange}
              onSearch={onSearch}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={s3_bucket_options}
            />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: 10, marginBottom: 10 }}>
          <Col span={24} style={{ height: 600 }}>
            <FullFileBrowser files={bucketFiles} folderChain={rootFolder} darkMode={true} />
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default MarketPlaceComponent;
