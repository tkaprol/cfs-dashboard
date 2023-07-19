import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Form } from 'antd';
import GeoMap from '../../components/geomaps/Map';
import { useKeycloak } from '@react-keycloak/web';
import { getBucketFiles } from '../../services/S3BucketService';
import { getUserWorkflows } from '../../services/dsl_DataService';
import { addAppCustomNotification } from '../../components/NotificationBox';

const MapsComponent = () => {
  const [selectedBucketId, setSelectedBucketId] = useState('');
  const [bucketFiles, setBucketFiles] = useState([]);
  const [selectedFileDataNames, setSelectedFileDataNames] = useState([]);
  const [s3BucketOptions, setS3BucketOptions] = useState([]);
  const { keycloak } = useKeycloak();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await getUserWorkflows(keycloak.token);
        const buckets = response.map((bucket) => ({
          label: bucket.name,
          value: bucket.id,
        }));
        setS3BucketOptions(buckets);
      } catch (err) {
        addAppCustomNotification('Dashboard Market Place', 'CRITICAL', 'Encountered an error!');
        console.error('Error fetching workflows:', err);
      }
    };

    fetchBuckets();
  }, [keycloak.token]);

  const loadBucketFiles = async (bucketId) => {
    try {
      const files = await getBucketFiles(keycloak.token, bucketId);
      const filteredFiles = files
        .filter((file) => ['.tif', '.tiff', '.nc', '.zip'].some((ext) => file.name.toLowerCase().endsWith(ext)))
        .map((file) => ({
          label: file.name,
          value: JSON.stringify({
            id: file.name,
            type: file.name.split('.').pop(),
            url: file.presignedUrl,
          }),
        }));
      setBucketFiles(filteredFiles);
    } catch (err) {
      console.error('Error loading bucket files:', err);
    }
  };

  const handleBucketChange = (value) => {
    setSelectedBucketId(value);
    loadBucketFiles(value);
  };

  const handleFilesChange = (values) => {
    setSelectedFileDataNames(values);
  };

  return (
    <>
      <Form form={form}>
        <Card>
          <Row>
            <Col span={14}>
              <Form.Item label='Workflow' required>
                <Select
                  showSearch
                  placeholder='Select Workflow'
                  optionFilterProp='children'
                  onChange={handleBucketChange}
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={s3BucketOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row style={{ marginBottom: 30 }}>
            <Col span={14}>
              <Form.Item
                label='Data Files'
                help={
                  <i style={{ fontSize: 10 }}>Only files with extensions '.tif', '.tiff', '.nc', '.zip' are allowed</i>
                }
                required
              >
                <Select
                  mode='multiple'
                  showSearch
                  placeholder='Select data files'
                  style={{ width: '100%' }}
                  optionFilterProp='children'
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={bucketFiles}
                  onChange={handleFilesChange}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
      <br />
      {selectedFileDataNames.length > 0 && (
        <Card>
          <div className='grid-container'>
            <GeoMap selectedFiles={selectedFileDataNames} zoomSize={3} />
          </div>
        </Card>
      )}
    </>
  );
};

export default MapsComponent;
