import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Spin, Alert, Typography, Space, Button } from 'antd';
import { ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useKeycloak } from '@react-keycloak/web';
import { getAllWorkflowMarketplaceComponents } from '../../services/dsl_DataService.js';
import ReactMarkdown from 'react-markdown';

const { Title, Text, Paragraph } = Typography;

function WorkflowIntroductionComponent() {
  const { keycloak, initialized } = useKeycloak();
  const [workflowComponents, setWorkflowComponents] = useState([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [error, setError] = useState(null);

  // State to track expanded details for each component
  const [expandedDetails, setExpandedDetails] = useState({});

  useEffect(() => {
    const fetchWorkflowData = async () => {
      if (!initialized || !keycloak.authenticated || !keycloak.token) {
        setIsLoadingApi(false);
        if (initialized && !keycloak.authenticated) {
          setError(new Error('You are not authenticated. Please log in to view components.'));
        } else {
          setError(new Error('Authentication status unclear or token not available.'));
        }
        return;
      }

      try {
        setIsLoadingApi(true);
        setError(null);
        const token = keycloak.token;
        const data = await getAllWorkflowMarketplaceComponents(token);
        setWorkflowComponents(data);
      } catch (err) {
        console.error('Failed to fetch workflow components:', err);
        setError(new Error(`Failed to load components: ${err.message || 'Unknown error. Please try again.'}`));
      } finally {
        setIsLoadingApi(false);
      }
    };

    fetchWorkflowData();
  }, [keycloak.token, keycloak.authenticated, initialized]);

  if (!initialized || isLoadingApi) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size='large' tip={!initialized ? 'Initializing authentication...' : 'Loading workflow components...'} />
      </div>
    );
  }

  if (error) {
    const isAuthError = error.message.includes('not authenticated');
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message={isAuthError ? 'Authentication Required' : 'Error Loading Data'}
          description={error.message}
          type='error'
          showIcon
          action={
            isAuthError &&
            keycloak && (
              <Button type='primary' onClick={() => keycloak.login()}>
                Log In
              </Button>
            )
          }
        />
      </div>
    );
  }

  if (!keycloak.authenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message='Access Denied'
          description='You are not authorized to view this content. Please log in.'
          type='warning'
          showIcon
          action={
            <Button type='primary' onClick={() => keycloak.login()}>
              Log In
            </Button>
          }
        />
      </div>
    );
  }

  // Toggle details visibility for a specific component
  const toggleDetails = (id) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      {workflowComponents.length > 0 ? (
        <Row gutter={[24, 24]}>
          {workflowComponents.map((component) => {
            const isExpanded = expandedDetails[component.id] || false;

            return (
              <Col xs={24} sm={24} md={24} lg={24} xl={24} key={component.id}>
                <Card
                  hoverable
                  className='component-card'
                  title={
                    <Space align='center'>
                      {component.icon && (
                        <img
                          src={component.icon}
                          alt={`${component.name} icon`}
                          style={{ width: '24px', height: '24px', marginRight: '8px' }}
                        />
                      )}
                      <Title level={4} style={{ margin: 0 }}>
                        {component.name}
                      </Title>
                      <Button type='link' onClick={() => toggleDetails(component.id)} style={{ marginLeft: '8px' }}>
                        {isExpanded ? 'Hide' : 'Show'}
                      </Button>
                    </Space>
                  }
                >
                  {/* DESCRIPTION: always visible */}
                  {component.description ? (
                    <div className='component-description' style={{ marginBottom: 12 }}>
                      <Text strong>Description:</Text>
                      <div style={{ marginTop: 6 }}>
                        <ReactMarkdown>{component.description}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <Paragraph type='secondary'>No description provided.</Paragraph>
                  )}

                  {/* OTHER DETAILS: toggled by Show/Hide */}
                  {isExpanded && (
                    <>
                      <Paragraph>
                        <Text strong>Type:</Text> {component.type}
                      </Paragraph>

                      <div style={{ marginTop: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                        <Space direction='vertical' size={5} style={{ width: '100%' }}>
                          <Text type='secondary'>
                            <ClockCircleOutlined style={{ marginRight: '4px' }} />
                            Created: {component.createdAt ? new Date(component.createdAt).toLocaleDateString() : '—'}
                          </Text>
                          <Text type='secondary'>
                            <SyncOutlined style={{ marginRight: '4px' }} />
                            Updated: {component.updatedAt ? new Date(component.updatedAt).toLocaleDateString() : '—'}
                          </Text>
                        </Space>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Alert
          message='No Components Found'
          description='There are no workflow components available at this time.'
          type='info'
          showIcon
        />
      )}
    </div>
  );
}

export default WorkflowIntroductionComponent;
