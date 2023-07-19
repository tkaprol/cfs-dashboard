import React, { useState, useEffect } from 'react';
import Iframe from 'react-iframe';
import { Card, Row, Col, Form, Select } from 'antd';
import { useKeycloak } from '@react-keycloak/web';
import { getUserWorkflows } from '../../services/dsl_DataService';
import { addAppCustomNotification } from '../../components/NotificationBox';

function XrVrComponent() {
  // State for storing workflow options and the currently selected workflow id
  const [s3BucketOptions, setS3BucketOptions] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const { keycloak } = useKeycloak();

  // Called when the user selects a workflow from the dropdown.
  const onChange = (value) => {
    setSelectedWorkflow(value);
  };

  const onSearch = (value) => {
    console.log('search:', value);
  };

  // Retrieve user workflows when the component mounts.
  useEffect(() => {
    if (keycloak && keycloak.token) {
      getUserWorkflows(keycloak.token)
        .then((response) => {
          const temporaryBuckets = response.map((bucket) => ({
            label: bucket.name,
            value: bucket.id,
          }));
          setS3BucketOptions(temporaryBuckets);
        })
        .catch((err) => {
          addAppCustomNotification('Dashboard XR VR', 'CRITICAL', 'Encountered an error!');
          console.error(err);
        });
    }
  }, []);

  // Build the XR/VR URL if a workflow is selected.
  const xrvrUrl = selectedWorkflow ? window.__RUNTIME_CONFIG__.REACT_APP_XR_VR_URL + selectedWorkflow : '';

  return (
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
              options={s3BucketOptions}
            />
          </Form.Item>
        </Col>
      </Row>
      {selectedWorkflow ? (
        <Iframe
          url={xrvrUrl}
          width='100%'
          styles={{ border: 'none', height: '100vh' }}
          id=''
          className=''
          display='block'
          position='relative'
        />
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '50vh' }}>
          <p>Please select a workflow.</p>
        </div>
      )}
    </Card>
  );
}

export default XrVrComponent;
