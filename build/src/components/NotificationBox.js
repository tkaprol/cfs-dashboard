import React, { useState, useEffect } from 'react';
import {
  NotificationOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useKeycloak } from '@react-keycloak/web';
import { getAllWorkflowData } from '../services/dsl_DataService';
// Global reference to add notifications from anywhere in the app
let addNotificationGlobal;

const NotificationBox = () => {
  const [notifications, setNotifications] = useState([]);
  const [reconnecting, setReconnecting] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState({});
  const [notificationLocal, setNotificationLocal] = useState();
  const { keycloak } = useKeycloak();

  // Local add notification function for CDF format
  const addNotificationCdfFormat = (name, level, description) => {
    const key = `${name}-${level}-${description}`;

    setNotifications((prev) => {
      // Find if the notification already exists
      const index = prev.findIndex(
        (notification) => `${notification.name}-${notification.level}-${notification.description}` === key,
      );

      let newNotifications;
      if (index !== -1) {
        // If notification exists, replace it
        newNotifications = [
          ...prev.slice(0, index), // Keep notifications before the matched one
          { name, level, description }, // Replace with the new one
          ...prev.slice(index + 1), // Keep notifications after the matched one
        ];
      } else {
        // If notification doesn't exist, add it to the end
        newNotifications = [...prev, { name, level, description }];
      }

      // Keep only the last 10 notifications
      return newNotifications.length > 10 ? newNotifications.slice(-10) : newNotifications;
    });
  };

  // Local add notification function for WS format
  const addNotificationWsFormat = (workflowName, state, components, details) => {
    const key = `${workflowName}-${state}`;

    setNotifications((prev) => {
      // Find if the notification already exists
      const index = prev.findIndex((notification) => `${notification.workflowName}-${notification.state}` === key);

      let newNotifications;
      if (index !== -1) {
        // If notification exists, replace it
        newNotifications = [
          ...prev.slice(0, index), // Keep notifications before the matched one
          { workflowName, state, components, details, type: 'WS' }, // Replace with the new one
          ...prev.slice(index + 1), // Keep notifications after the matched one
        ];
      } else {
        // If notification doesn't exist, add it to the end
        newNotifications = [...prev, { workflowName, state, components, details, type: 'WS' }];
      }

      // Keep only the last 10 notifications
      return newNotifications.length > 10 ? newNotifications.slice(-10) : newNotifications;
    });
  };

  // Initialize global addNotification function
  useEffect(() => {
    addNotificationGlobal = addNotificationCdfFormat;
    return () => {
      addNotificationGlobal = null; // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      ws = new WebSocket(
        `${window.__RUNTIME_CONFIG__.REACT_APP_API_ROOT_URI.replace(
          'http',
          'ws',
        )}/Kafka/monitoring?timestamp=${Date.now()}`,
      );

      ws.onopen = () => {
        setReconnecting(false);
      };

      ws.onmessage = async (event) => {
        try {
          // Skip if the event data is the same as the previous notification
          if (notificationLocal === event.data) {
            return;
          }

          // Update the local notification state
          setNotificationLocal(event.data);

          let incomingData;
          try {
            incomingData = JSON.parse(event.data);
          } catch (parseError) {
            incomingData = [];
            event.data.forEach((item) => {
              incomingData.append(JSON.parse(item));
            });
          }

          // Fetch workflows associated with the current user
          let userWorkflows = await getAllWorkflowData(keycloak.token);

          // Ensure `userWorkflows` is always an array
          if (!Array.isArray(userWorkflows)) {
            console.warn('userWorkflows is not an array. Converting to an empty array.');
            userWorkflows = [];
          }

          let workflowsToProcess = [];

          // Determine if incomingData is an array of JSON strings or a single JSON object string
          if (Array.isArray(incomingData)) {
            // If it's an array, iterate and parse each item
            workflowsToProcess = incomingData
              .map((workflowStr) => {
                try {
                  return JSON.parse(workflowStr); // SECOND PARSE: Parse each workflow string
                } catch (err) {
                  console.error('Failed to parse individual workflow string:', workflowStr, err);
                  return null;
                }
              })
              .filter((workflow) => workflow !== null); // Remove any nulls from failed parses
          } else if (incomingData && typeof incomingData === 'object' && !Array.isArray(incomingData)) {
            // If incomingData is already a parsed object (not an array of strings)
            // It might be a single workflow object or an object where values are workflow strings
            if (incomingData.Workflow) {
              // Check if it looks like a single workflow object
              workflowsToProcess.push(incomingData);
            } else {
              // Assume it's an object containing workflow strings as values
              workflowsToProcess = Object.values(incomingData)
                .map((workflowStr) => {
                  try {
                    // This might be redundant if incomingData was already fully parsed.
                    // But it handles the case where values are still strings.
                    return typeof workflowStr === 'string' ? JSON.parse(workflowStr) : workflowStr;
                  } catch (err) {
                    console.error('Failed to parse workflow from object value:', workflowStr, err);
                    return null;
                  }
                })
                .filter((workflow) => workflow !== null);
            }
          } else {
            console.error('Incoming data is neither an array nor a single object. Skipping processing.');
            return;
          }

          // Process each parsed workflow
          workflowsToProcess.forEach((incomingWorkflowString) => {
            incomingWorkflowString.forEach((workflowNotification) => {
              try {
                let incomingWorkflow = JSON.parse(workflowNotification);
                const matchingWorkflow = userWorkflows.find(
                  (existingWorkflow) => incomingWorkflow?.Workflow === existingWorkflow?.id,
                );
                if (matchingWorkflow) {
                  // Replace the Workflow ID with the name
                  if (matchingWorkflow.name) {
                    incomingWorkflow.Workflow = matchingWorkflow.name;
                  }

                  // Add a formatted notification
                  addNotificationWsFormat(
                    matchingWorkflow.name,
                    incomingWorkflow.State,
                    incomingWorkflow.Components,
                    incomingWorkflow.Details,
                  );
                }
              } catch (e) {
                console.error('Failed to parse incomingWorkflowString:', e);
              }
            });
          });
        } catch (err) {
          console.error('Error processing WebSocket event data:', err);
        }
      };

      ws.onerror = (error) => {};

      ws.onclose = () => {
        if (!reconnecting) {
          setReconnecting(true);
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
      clearTimeout(reconnectTimeout);
      window.removeEventListener('beforeunload', () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    };
  }, [reconnecting]);

  const toggleDetails = (index) => {
    setDetailsVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderNotificationIcon = (notification) => {
    const levelOrState = notification.level || notification.state;

    switch (levelOrState) {
      case 'INFO':
        return <InfoCircleOutlined style={{ color: '#007bb5' }} />;
      case 'WARNING':
        return <WarningOutlined style={{ color: '#ff9800' }} />;
      case 'SUCCESS':
        return <CheckCircleOutlined style={{ color: '#4caf50' }} />;
      case 'ERROR':
        return <CloseCircleOutlined style={{ color: '#f44336' }} />;
      default:
        return <NotificationOutlined />;
    }
  };

  return (
    <div
      className='notification-box'
      style={{
        margin: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#5BC0E1',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '10px 0',
          backgroundColor: '#007bb5',
          color: '#fff',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
        }}
      >
        <h3 style={{ margin: 0 }}>
          <NotificationOutlined /> Notifications
        </h3>
      </div>
      <div
        style={{
          maxHeight: '290px',
          overflowY: 'auto',
          padding: '5px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#007bb5 #5BC0E1',
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              width: 10px;
            }
            div::-webkit-scrollbar-track {
              background: #5BC0E1;
              border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb {
              background: #007bb5;
              border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #005f8d;
            }
          `}
        </style>
        {notifications.length > 0 ? (
          <div className='notifications-list'>
            {notifications.map((notification, index) => (
              <div
                key={index}
                className='notification-item'
                style={{
                  margin: '10px 0',
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column', // Ensure everything stacks vertically
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {renderNotificationIcon(notification)}
                  <p style={{ margin: '0 0 0 10px' }}>
                    <strong>{notification.name || notification.workflowName}</strong> -{' '}
                    {notification.level || notification.state}
                  </p>
                </div>
                {notification.description && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Description: </strong>
                    <div>{notification.description}</div>
                  </div>
                )}
                {notification.components && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Components:</strong>
                    <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
                      {Object.entries(notification.components).map(([key, value]) => (
                        <li key={key} style={{ margin: '3px 0' }}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {detailsVisible[index] && notification.details && (
                  <div
                    style={{
                      borderRadius: '5px',
                      backgroundColor: '#f9f9f9',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <strong>Details:</strong>
                    <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
                      {Object.entries(notification.details).map(([key, detailsArray]) => (
                        <li key={key} style={{ marginBottom: '10px' }}>
                          <strong>{key}:</strong>
                          <div style={{ paddingLeft: '0px' }}>
                            {' '}
                            {/* Reduced margin for better spacing */}
                            {detailsArray.map((detail, idx) => (
                              <div key={idx} style={{ marginBottom: '10px' }}>
                                <div>
                                  <strong>Status: </strong>
                                  {detail.Status}
                                </div>
                                <div>
                                  <strong>Description: </strong>
                                  {detail.Description}
                                </div>
                                <div>
                                  <strong>Timestamp: </strong>
                                  {detail.Timestamp}
                                </div>
                              </div>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {notification.type === 'WS' && (
                  <button
                    onClick={() => toggleDetails(index)}
                    style={{
                      marginTop: '10px',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      backgroundColor: '#007bb5',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {detailsVisible[index] ? 'Hide Details' : 'More Details'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <p style={{ margin: 0, color: '#555' }}>No Notifications Yet!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export global addNotification function
export const addAppCustomNotification = (name, level, description) => {
  if (addNotificationGlobal) {
    addNotificationGlobal(name, level, description);
  } else {
    console.warn('Notification manager is not initialized.');
  }
};

export default NotificationBox;
