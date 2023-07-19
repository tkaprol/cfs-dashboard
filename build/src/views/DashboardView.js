import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Button, Table, Space, Drawer, Card, Row, Col, Tabs, Popconfirm, Select, Tag, Input, Divider, Typography, Collapse, Cascader, List, Form} from 'antd';
import {CheckCircleOutlined, SyncOutlined, MinusCircleOutlined} from '@ant-design/icons';
//import Graph from 'react-vis-network-graph';
import { connect } from 'react-redux';
import { deleteItem, getItems } from '../redux/product/actions';
import { AddCart, DeleteCart } from '../redux/cart/actions';
import { useKeycloak } from '@react-keycloak/web';

import { addAppCustomNotification } from '../components/NotificationBox';

import {
  executeQuery,
  executeQueryAdvanced,
  generateApiCall,
  getKG_ServiceStatus,
  searchDataSet,
  searchDataSetBreakdownPerId,
  startKG_Service,
  searchDataSetV1,
  searchDataSetV2,
  searchFullMetaData,
  searchBasicMetaDataSet,
} from '../services/kg_DataService';

import FileExplorerComponent from './dashboard/FileExplorerComponent';
import WorkflowEditorComponent from './dashboard/WorkflowEditorComponent';
import KgDetailedComponent from './dashboard/KgDetailedComponent';
import WorkflowCreatorComponent from './dashboard/WorflowCreatorComponent';
import MapsComponent from './dashboard/MapVisualizationComponent';
import DataVisualizationV2 from './dashboard/DataVisualizationComponentV2';
import XrVrComponent from './xrvr/XrVrComponent';
import WorkflowIntroductionComponent from './dashboard/WorkflowIntroductionComponent';
import { Link } from 'react-router-dom';
import { createContext } from 'react';

const initialCount = 0;
export const KgWorkflowContext = createContext({ count: initialCount, tabId: [], pythonScript: null, metaJson: null });
const { Paragraph } = Typography;

const { Panel } = Collapse;

const { Search } = Input;

function DashboardView(productsWF) {
  const [kgwf, setKgwf] = useState(initialCount);
  const [activePanels, setActivePanels] = useState(['WE']);

  const reset = () => setKgwf(initialCount);
  const decrement = () => setKgwf((prevCount) => prevCount - 1);
  const increment = () => setKgwf((prevCount) => prevCount + 1);
  const tabSet=(value) => setKgwf(value);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Record ID',
      dataIndex: 'dummyRecordId',
      key: 'id',
    },
    {
      title: 'Recorded At',
      dataIndex: 'dateRecorded',
      key: 'date',
      filters: [
        {
          text: 'Today',
          value: new Date().toLocaleDateString(),
        },
        {
          text: 'Yesterday',
          value: () => {
            var date = new Date();
            date.setDate(date.getDate() - 1)

            return date.toLocaleDateString()
          },
        },
        {
          title: 'Values',
          dataIndex: 'values',
          align: 'right',
          key: 'values',
          render: (_, record) => (
            <Space size="middle" key={record.dummyRecordId} >
              <Button onClick={(e) => ShowStoreDataInModal(e,record)}>View Data</Button>
            </Space>
          )   
        },
      ];
    
    // const columns_for_searched_datasets = [
    //   {
    //     title: 'ID',
    //     dataIndex: 'ID',
    //     key: 'x-id',
    //   },
    //   {
    //     title: 'Name',
    //     dataIndex: 'Name',
    //     key: 'name'
    //   },
    //   {
    //     title: 'Parse From Adam ?',
    //     dataIndex: 'ParsedFromAdam',
    //     key: 'parsefromadam',
    //     render: (_, record) => {
    //       return (record.ParsedFromAdam) ? (<Tag color="success" key="t1">
    //         TRUE
    //       </Tag>) : (<Tag color="error" key="t1">
    //         FALSE
    //       </Tag>)
    //     }
    //   },
    //   {
    //     title: 'Source',
    //     dataIndex: 'Source',
    //     key: 'source',
    //   },
    //   {
    //     title: 'Description',
    //     dataIndex: 'Description',
    //     key: 'description'
    //   },
    //   // {
    //   //   title: 'Data Types',
    //   //   dataIndex: 'DataTypes',
    //   //   key: 'datatypes',
    //   //   render: (_, record) => (
    //   //     <>
    //   //     {record.DataTypes.map((item, key) => (
    //   //       <Tag color={'purple'} key={key}>
    //   //         {item}
    //   //       </Tag>
    //   //     ))}
    //   //     </>
    //   //   )
    //   // },
    //   // {
    //   //   title: 'File Formats',
    //   //   dataIndex: 'FileFormats',
    //   //   key: 'fileformats',
    //   //   render: (_, record) => (
    //   //     <>
    //   //     {record.FileFormats.map((item) => (
    //   //       <Tag color={'cyan'} key={item}>
    //   //         {item}
    //   //       </Tag>
    //   //     ))}
    //   //     </>
    //   //   )
    //   // },
    //   // {
    //   //   title: 'Variables',
    //   //   dataIndex: 'Variables',
    //   //   key: 'variables',
    //   //   render: (_, record) => (
    //   //     <>
    //   //     {record.Variables.map((item) => (
    //   //       <Tag color="blue" key={item}>
    //   //         {item}
    //   //       </Tag>
    //   //     ))}
    //   //     </>
    //   //   )
    //   // }
    // ];

    const [open, setOpen] = useState(false);
    
    const [records, setRecords] = useState([]);

    const [serviceStatus, SetServiceStatus] = useState("Stopped");

    const [selected, SetSelected] = useState({
        dummyRecordId: '',
        dummyRecordData: '{}'
    });

    const [searchResults, setSearchResults] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [serviceStarted, setServiceStarted] = useState(false);


  const [open, setOpen] = useState(false);

  const [records, setRecords] = useState([]);

    //const [datasetTags, SetRelatedDatasetTags] = useState([]);

  const [selected, SetSelected] = useState({
    dummyRecordId: '',
    dummyRecordData: '{}',
  });

  const { keycloak } = useKeycloak();
  const [searchResults, setSearchResults] = useState([]);
  const [serviceStarted, setServiceStarted] = useState(false);


    const [tabItems, SetTabItems] = useState([]);

  const [datasetInformations, SetDatasetInformations] = useState([]);
  const [selectedDataSetId, SetSelectedDataSetId] = useState(null);
  const [selectedDataSetPersistentId, SetSelectedDataSetPersistentId] = useState(null);

  const [datasets_api_options, setDatasetApiOptions] = useState([]);

  const [selectedDownloadOption, SetSelectedDownloadOptions] = useState("");
  const [selectedMetaInfoFields, SetSelectedMetaInfoFields] = useState([]);
  const { keycloak } = useKeycloak();

    useEffect(() => {
      getStoreDataByRange()
        .then((resp) => {
            setRecords(resp);
            setIsLoading(false);
        });
    }, [])

  // const [ selectedTemporalAggregationOptions, SetSelectedTemporalAggregationOptions] = useState([]);
  // const [temporalAggOptions, SetTemporalAggOptions] = useState([]);

  const [jsonMeta, SetJsonMeta] = useState({});

  const [isSearching, SetIsSearching] = useState(false);
  const [openDetailed, SetOpenDetailed] = useState(false);
  const [PassedDatasetInformation, SetPassedDatasetInformation] = useState({});
  const [configDetails, SetApiConfigDetails] = useState({});
  const [selectedSearchedSources, SetSelectedSearchedSources] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);

  useEffect(() => {
    //setServiceStarted(true)
    setActivePanels(kgwf.tabId);
  }, [kgwf]);

  useEffect(() => {
    getKG_ServiceStatus(keycloak.token).then((resp) => {
      SetServiceStatus(resp.payload);
      if (resp.payload === 'Available') {
        setServiceStarted(true);
      }
    });
  }, []);

  const onClose = () => {
    setOpen(false);
  };
  const onChangePanel = (activeKey) => {
    setActivePanels(activeKey);
  };

  const OnServiceStart = () => {
    startKG_Service(keycloak.token).then((resp) => {
      if (resp === 'Done') {
        setServiceStarted(true);
      }
    });
  };

  const onSearchQuery = (value) => {
    const query = value;

    if (query !== '') {
      setSearchResults([]);
      SetIsSearching(true);
      if (selectedSearchedSources.length > 0) {
        executeQueryAdvanced(keycloak.token, query, selectedSearchedSources)
          .then((resp) => {
            if (resp !== '' || resp != null || resp != undefined) {
              var fake = resp.payload;
              if (Array.isArray(fake) && fake.length >= 0) {
                setSearchResults(fake);

                var dataset_options = [];

                for (let j = 2; j < fake.length + 2; j++) {
                  var i = j - 2;
                  const element = fake[i];
                  dataset_options.push({
                    label: 'ID: ' + element,
                    value: element,
                  });
                }
                searchDataSet(keycloak.token, fake)
                  .then((response) => {
                    var results = response.payload;
                    console.log('yessssss', results);
                    var ds = [];

                    for (let index = 0; index < results.length; index++) {
                      var dataset = results[index].metadata;
                      console.log(results[index].persistentID, dataset['FileFormat'], 'inside');
                      ds.push({
                        id: results[index].id,
                        persistentId: results[index].persistentID,
                        title: dataset['Title'][0].values[0],
                        description: dataset['Description'][0].values[0],
                        isfromadam: dataset['Source'][0].values[0] == 'adam' ? true : false,
                        isfromSentinel: dataset['Source'][0].values[0] == 'sentinel' ? true : false,
                        content: (
                          <>
                            <Tag color='blue' key={'item'}>
                              {'item'}
                            </Tag>
                          </>
                        ),
                        fileformats:
                          dataset['FileFormat'] != undefined ? (
                            <>
                              {dataset['FileFormat'] &&
                                dataset['FileFormat'][0].values.map((item) => (
                                  <Tag color={'cyan'} key={item}>
                                    {item}
                                  </Tag>
                                ))}
                            </>
                          ) : (
                            <>
                              <Tag color={'red'}>{'undefined'}</Tag>
                            </>
                          ),

                        source: (
                          <>
                            <Tag color='blue' key={dataset['Source'][0].values[0]}>
                              {dataset['Source'][0].values[0]}
                            </Tag>
                          </>
                        ),
                      });
                    }

                    SetDatasetInformations(ds);

                    SetIsSearching(false);
                  })
                  .catch((error) => {
                    console.log(error);
                    SetIsSearching(false);
                    addAppCustomNotification(
                      'Dashboard',
                      'CRITICAL',
                      'No results found for this query, please try again later.',
                    );
                  });
              } else {
                setSearchResults([]);
                SetDatasetInformations([]);
                SetIsSearching(false);
                addAppCustomNotification('Dashboard', 'CRITICAL', `No results found for this query, '${query}'.`);
              }
            } else {
              SetIsSearching(false);
              addAppCustomNotification(
                'Dashboard',
                'CRITICAL',
                'No results found for this query, please try again later.',
              );
            }
          })
          .catch((error) => {
            SetIsSearching(false);
            addAppCustomNotification('Dashboard', 'CRITICAL', 'Encounter an error!');
            console.log(error);
          });
      } else {
        executeQuery(keycloak.token, query)
          .then((resp) => {
            if (resp !== '' || resp != null || resp != undefined) {
              var fake = resp.payload;
              if (Array.isArray(fake) && fake.length >= 0) {
                setSearchResults(fake);

                var dataset_options = [];

                for (let j = 2; j < fake.length + 2; j++) {
                  var i = j - 2;
                  const element = fake[i];
                  dataset_options.push({
                    label: 'ID: ' + element,
                    value: element,
                  });
                }
                searchDataSet(keycloak.token, fake, true)
                  .then((response) => {
                    var results = response.payload;
                    var ds = [];

                    for (let index = 0; index < results.length; index++) {
                      var dataset = results[index].metadata;
                      ds.push({
                        id: results[index].id,
                        persistentId: results[index].persistentID,
                        title: dataset['Title'][0].values[0],
                        description: dataset['Description'][0].values[0],
                        isfromadam: dataset['Source'][0].values[0] == 'adam' ? true : false,
                        isfromSentinel: dataset['Source'][0].values[0] == 'sentinel' ? true : false,
                        content: (
                          <>
                            <Tag color='blue' key={'item'}>
                              {results[index].persistentID}
                            </Tag>
                          </>
                        ),
                        fileformats:
                          dataset['FileFormat'] != undefined ? (
                            <>
                              {dataset['FileFormat'] &&
                                dataset['FileFormat'][0].values.map((item) => (
                                  <Tag color={'cyan'} key={item}>
                                    {item}
                                  </Tag>
                                ))}
                            </>
                          ) : (
                            <>
                              <Tag color={'red'}>{'undefined'}</Tag>
                            </>
                          ),

                        source: (
                          <>
                            <Tag color='blue' key={dataset['Source'][0].values[0]}>
                              {dataset['Source'][0].values[0]}
                            </Tag>
                          </>
                        ),
                      });
                    }

                    SetDatasetInformations(ds);

                    SetIsSearching(false);
                  })
                  .catch((error) => {
                    console.log(error);
                    SetIsSearching(false);
                    addAppCustomNotification(
                      'Dashboard',
                      'CRITICAL',
                      'No results found for this query, please try again later.',
                    );
                  });
              } else {
                setSearchResults([]);
                SetDatasetInformations([]);
                SetIsSearching(false);
                addAppCustomNotification('Dashboard', 'CRITICAL', `No results found for this query, '${query}'.`);
              }
            } else {
              SetIsSearching(false);
              addAppCustomNotification(
                'Dashboard',
                'CRITICAL',
                'No results found for this query, please try again later.',
              );
            }
          })
          .catch((error) => {
            SetIsSearching(false);
            addAppCustomNotification('Dashboard', 'CRITICAL', 'Encounter an error!');
            console.log(error);
          });
      }
    }
  };

  const CurrentTag = () => {
    if (serviceStatus === 'Available') {
      return (
        <Tag icon={<CheckCircleOutlined />} color='success'>
          {serviceStatus}
        </Tag>
      );
    }

    if (serviceStatus === 'Loading') {
      return (
        <Tag icon={<SyncOutlined spin />} color='processing'>
          {serviceStatus}
        </Tag>
      );
    }

    if (serviceStatus === 'Stopped') {
      return (
        <Tag icon={<MinusCircleOutlined />} color='error'>
          {serviceStatus}
        </Tag>
      );
    }
  };

  const SearchResults = () => {
    if (serviceStatus === 'Available' && searchResults.length > 0) {
      return (
        <Paragraph>
          <Divider />
          <p>
            We found a total of <b>{searchResults.length}</b> datasets
          </p>
          {/* <Graph graph={graphData} options={nodeOptions} events={events} style={{ height: 600 }} /> */}
        </Paragraph>
      )
    }

    // const onchangeDataSetId = (value) => {
    //   const id = value;

    //   if(value !== selectedDataSetId){
    //     SetTabItems([]);
    //     form.resetFields();
    //   }

    //   searchDataSetBreakdownPerId(id)
    //     .then((res) => {
    //       SetSelectedDataSetId(id);
          
    //       SetSelectedDatasetBreakDown(res);
    //       var result = JSON.parse(JSON.stringify(res));

    //       SetJsonMeta(result);
    //       //var result = perm;
    //       var options = result.DownloadOptions;

    //       var products = result.Products;

    //       var newOptions = [];

    //       for (let i = 0; i < options.length; i++) {
    //         const element = options[i];
            
    //         newOptions.push({
    //           label: element,
    //           value: element
    //         });
    //       }

    //       var productsTree = [];

    //       for (let j = 0; j < products.length; j++) {
    //         var features = products[j].Features;
    //         var productId = products[j].ID

    //         var node = {
    //           label: 'Product ' + productId,
    //           value: productId,
    //           key: j,
    //           children: []
    //         };
            
    //         for (let k = 0; k < features.length; k++) {
    //           var featureOptions = features[k].Options;
    //           var featureName = features[k].Name;

    //           node.children.push({
    //             label: featureName,
    //             value: featureName,
    //             disabled:true,
    //             children: featureOptions.map((item) => {
    //               return {
    //                 label: item,
    //                 value: item,
    //                 disabled: true
    //               };
    //             })
    //           });
    //         }

    //         productsTree.push(node);
    //       }

    //       setDatasetApiOptions(productsTree);
    //       SetDownloadOptions(newOptions);
    //     })
    //     .catch((err) => {
    //       showErrorMessage(err);
    //     });
      
      // searchRelatedDataSetsPerId(id)
      //   .then((res) => {
      //     var tags = [];

      //     for (let i = 0; i < res.results.length; i++) {
      //       const element = res.results[i];
            
    //         tags.push(
    //           <Tag color="#108ee9">ID: {element}</Tag>
    //         );
    //       }
    //       SetRelatedDatasetTags(tags)
    //     })
    //     .catch((err) => {
    //       showErrorMessage(err);
    //     });
    // }

    const onchangeDownloadOptions = (value) => {
      SetSelectedDownloadOptions(value)
    }
  };

  const options = [
    {
      value: 'ADS',
      label: 'ADS',
    },
    {
      value: 'CDS',
      label: 'CDS',
    },
    {
      value: 'ADAM',
      label: 'ADAM',
    },
    {
      value: 'CMCC',
      label: 'CMCC',
    },
    {
      value: 'DestinE',
      label: 'DestinE',
    },
    {
      value: 'Eumetsat',
      label: 'Eumetsat',
    },
    {
      value: 'Noaa',
      label: 'Noaa',
    },
    {
      value: 'Sentinel',
      label: 'Sentinel',
    },
    {
      value: 'Silam',
      label: 'Silam',
    },
    {
      value: 'Inspire',
      label: 'Inspire',
    },
    {
      value: 'Istat',
      label: 'Istat',
    },
    {
      value: 'Land',
      label: 'Land',
    },
    {
      value: 'Marine',
      label: 'Marine',
    },
    {
      value: 'InSitu',
      label: 'InSitu',
    },
  ];

  const onOpenDetailedDataset = (datasetId, persistentId) => {
    GetAndSetDetailedDatasetInfo(datasetId);
    console.log(
      'this is options source',
      selectedSearchedSources,
      selectedSearchedSources.some((item) => item.toLowerCase() != 'silam'),
    );
    const dataSetInfo = datasetInformations.find((item) => item.id === datasetId);
    if (dataSetInfo && dataSetInfo.isfromadam === false && dataSetInfo.isfromSentinel === false) {
      GetAndSetBreakdonwDataset(datasetId);
    }

    SetSelectedDataSetPersistentId(persistentId.persistentId);
    SetSelectedDataSetId(datasetId);
    setSelectedDataset(persistentId);
    SetOpenDetailed(true);
  };

  const GetAndSetDetailedDatasetInfo = (datasetId) => {
    var ids = [];
    ids.push(datasetId);

    var res = searchDataSet(keycloak.token, datasetId, false)
      .then((response) => {
        var results = response.payload;
        var ds = [];

        for (let index = 0; index < results.length; index++) {
          var dataset = results[index].metadata;
          console.log(results[index]);
          ds.push({
            id: results[index].id,
            persistentId: results[index].persistentID,
            title: dataset['Title'][0].values[0],
            description: dataset['Description'][0].values[0],
            isfromadam: dataset['Source'][0].values[0] == 'adam' ? true : false,
            isfromSentinel: dataset['Source'][0].values[0] == 'sentinel' ? true : false,
            content: (
              <>
                <Tag color='blue' key={'item'}>
                  {'item'}
                </Tag>
              </>
            ),
            fileformats:
              dataset['FileFormat'] != undefined ? (
                <>
                  {dataset['FileFormat'] &&
                    dataset['FileFormat'][0].values.map((item) => (
                      <Tag color={'cyan'} key={item}>
                        {item}
                      </Tag>
                    ))}
                </>
              ) : (
                <>
                  <Tag color={'red'}>{'undefined'}</Tag>
                </>
              ),

            source: (
              <>
                <Tag color='blue' key={dataset['Source'][0].values[0]}>
                  {dataset['Source'][0].values[0]}
                </Tag>
              </>
            ),
          });
        }

        SetPassedDatasetInformation(ds[0]);
        console.log(PassedDatasetInformation);
      })
      .catch((error) => {
        console.log(error);
        addAppCustomNotification('Dashboard', 'CRITICAL', 'No results found for this query, please try again later.');
        SetPassedDatasetInformation({});
      });
  };

  const transformProductToCascaderOptions = (product) => {
    const { id, features } = product;

    return {
      value: id,
      label: `Product ${id}`,
      children: Object.keys(features).map((featureKey) => ({
        value: featureKey,
        label: featureKey.charAt(0).toUpperCase() + featureKey.slice(1), // Capitalize feature names
        children: features[featureKey].map((featureValue) => ({
          value: featureValue,
          label: featureValue,
        })),
      })),
    };
  };

  const GetAndSetBreakdonwDataset = (id) => {
    searchDataSetBreakdownPerId(keycloak.token, id)
      .then((res) => {
        if (JSON.stringify(res) !== '{}' && JSON.stringify(res) !== JSON.stringify({ Error: 'Invalid input' })) {
          var result = JSON.parse(JSON.stringify(res));

          var products = result.payload.products;
          var newOptions = [];

          if (result.payload.metadata.DownloadOption != undefined) {
            result.payload.metadata.DownloadOption[0].values.forEach((element) => {
              newOptions.push({
                label: element,
                value: element,
              });
            });
          }
          var productsTree = [];

          for (const element of products) {
            let node = transformProductToCascaderOptions(element);
            productsTree.push(node);
          }

          const productDict = products.reduce((acc, product) => {
            acc[product.id] = product.features;
            return acc;
          }, {});

          SetApiConfigDetails({
            json: productDict,
            cascader: productsTree,
            download_options: newOptions,
          });
        } else if (JSON.stringify(res) === JSON.stringify({ Error: 'Invalid input' })) {
          SetApiConfigDetails({
            json: {},
            cascader: [],
            download_options: [],
          });
        }
      })
      .catch((err) => {
        addAppCustomNotification('Dashboard', 'CRITICAL', 'Encounter an error!');
        console.log(err);
        SetApiConfigDetails({
          json: {},
          cascader: [],
          download_options: [],
        });
      });
  };

  const onSelectQuerySources = (value) => {
    SetSelectedSearchedSources(value);
  };

  return (
    <KgWorkflowContext.Provider value={{ kgwf, reset, decrement, increment, tabSet }}>
      <MainLayout menu='1'>
        <Collapse size='large' onChange={onChangePanel} activeKey={activePanels}>
          <Panel header='AI/ML Marketplace' key='WEH'>
            <WorkflowIntroductionComponent />
          </Panel>
          <Panel header={'Dataset Search'} key='KG'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CurrentTag />
              <Button type='primary' disabled={serviceStarted} onClick={OnServiceStart}>
                Start KG Service
              </Button>
            </div>
            {serviceStarted === true && (
              <div>
                <Card title='Query Search'>
                  <Row>
                    <Col span={24}>
                      <Space.Compact style={{ width: '100%' }} size='large'>
                        <Select
                          placeholder='Select Sources (Leave it blank means all options selected)'
                          showSearch
                          style={{ width: '30%' }}
                          optionFilterProp='children'
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          onChange={onSelectQuerySources}
                          multiple
                          maxTagCount='responsive'
                          mode='tags'
                          size='large'
                          options={options}
                        />
                        <Search
                          placeholder="Enter a string to make a research e.g: 'climate change'"
                          allowClear
                          enterButton='Search'
                          style={{ width: '100%' }}
                          size='large'
                          onSearch={onSearchQuery}
                        />
                      </Space.Compact>
                    </Col>
                  </Row>

                  <SearchResults />
                  <List
                    itemLayout='vertical'
                    loading={isSearching}
                    size='large'
                    pagination={{
                      onChange: (page) => {
                        console.log(page);
                      },
                      pageSize: 10,
                    }}
                    dataSource={datasetInformations}
                    renderItem={(item) => (
                      <List.Item
                        key={item.id}

                        // about={item.datatypes}
                        // content={item.fileformats}
                      >
                        <List.Item.Meta
                          title={<Link onClick={(e) => onOpenDetailedDataset(item.id, item, e)}> {item.title} </Link>}
                          description={item.description}
                        />
                        {item.source} |
                        <span>
                          <i style={{ marginLeft: 15 }}>From Adam: </i>
                          {item.isfromadam === true && (
                            <Tag color={'green'} key='0'>
                              {' '}
                              YES
                            </Tag>
                          )}
                          {item.isfromadam === false && (
                            <Tag color={'red'} key='1'>
                              {' '}
                              NO
                            </Tag>
                          )}
                        </span>
                      </List.Item>
                    )}
                  />
                </Card>
                <br />
              </div>
            )}
          </Panel>
          <Panel header='Workflow Creator' key='WC'>
            <WorkflowCreatorComponent />
          </Panel>
          <Panel header='Workflow Editor' key='WE'>
            <WorkflowEditorComponent />
          </Panel>
          <Panel header='Data Visualization' key='DV'>
            <DataVisualizationV2 />
          </Panel>
          <Panel header='Map Visualization' key='MV'>
            <MapsComponent />
          </Panel>
          <Panel header='File Explorer' key='BM'>
            <FileExplorerComponent />
          </Panel>
          <Panel header='XR/VR' key='XR'>
            <XrVrComponent />
          </Panel>
        </Collapse>

        {/* <KgDetailedComponent
          datasetid={selectedDataSetId}
          persistentId={selectedDataSetPersistentId}
          dataset={PassedDatasetInformation}
          breakdown={configDetails}
          isopen={openDetailed}
          productsWF={productsWF}
          close={() => SetOpenDetailed(false)}
        /> */}

        {selectedDataset && (
          <KgDetailedComponent
            datasetid={selectedDataset.id}
            persistentId={selectedDataset.persistentId}
            dataset={selectedDataset}
            breakdown={configDetails}
            isopen={openDetailed}
            productsWF={productsWF}
            sources={selectedSearchedSources}
            close={() => {
              SetOpenDetailed(false);
              setSelectedDataset(null);
            }}
          />
        )}

                <Row>
                  <Col span={24}>
                    <Space.Compact style={{ width: '100%' }} size='large'>
                      <Select placeholder="Select Sources (Leave it blank means all options selected)" showSearch
                        style={{ width: '30%' }}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={onSelectQuerySources}
                        multiple
                        maxTagCount="responsive"
                        mode="tags"
                        size='large'
                        options={options} />
                      <Search
                        placeholder="Enter a string to make a research e.g: 'climate change'"
                        allowClear
                        enterButton="Search"
                        style={{ width: '100%' }}
                        size="large"
                        onSearch={onSearchQuery}
                      />
                    </Card>
                    <br/>
                    {/* <Card title="Dataset Information">
                        <Select
                        showSearch
                        placeholder="Select multiple Datasets IDs"
                        style={{width: '100%'}}
                        disabled={!serviceStarted}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={searchedDataSet}
                        onChange={handleChangeDataSetId}
                        tokenSeparators={[',']}
                        mode="tags"
                        />
                      <p>
                        <Table dataSource={datasetInformations} columns={columns_for_searched_datasets}/>
                      </p>
                    </Card>
                    <br/> */}
                    {/* <Card title="Related Dataset Per ID / API">
                      <Select
                          showSearch
                          placeholder="Select Dataset ID"
                          style={{width: '100%'}}
                          disabled={!serviceStarted}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={searchedDataSet}
                          onChange={onchangeDataSetId}
                      />

                      <p>
                          <p>
                            <Row>
                              <Col span={12}>
                                <Divider>Related Dataset</Divider>
                                  {datasetTags}
                              </Col>
                              <Col span={24}>
                                <Divider>Dataset Breakdown</Divider>
                                <Collapse>
                                    <Panel header="JSON Representation" key="1" style={{maxHeight:400, overflowY: 'scroll'}}>
                                      <pre>
                                        {JSON.stringify(selectedDatasetBreakDown, null, 2)}
                                      </pre>
                                    </Panel>
                                </Collapse>
                              </Col>
                            </Row>
                          </p>
                          <p>
                            <Divider>API</Divider>
                            <Card>
                            <Form form={form} name="advanced_filter">
                              <Row>
                              <Col span={10}>
                                <Form.Item name="Dataset Meta Info">
                                  <Cascader
                                    style={{
                                      width: '100%',
                                    }}
                                    placeholder="Select Dataset Meta Info"
                                    options={datasets_api_options}
                                    multiple
                                    maxTagCount="responsive"
                                    onChange={onchangeMetaDataOptions}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={10} offset={1}>
                                <Form.Item name="Dataset Download Option">
                                  <Select
                                    showSearch
                                    placeholder="Select Download Option"
                                    style={{width: '100%'}}
                                    disabled={!serviceStarted}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={dataset_api_download_options}
                                    onChange={onchangeDownloadOptions}
                                  />
                                  </Form.Item>
                                </Col>
                                <Col span={3} offset={1}>
                                  <Select
                                    showSearch
                                    placeholder="Select Period"
                                    style={{width: '100%'}}
                                    disabled={!serviceStarted}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={temporalAggOptions}
                                    onChange={onchangeTemporalAggregationOptions}
                                    tokenSeparators={[',']}
                                    mode="tags"
                                  />
                                </Col>
                                <Col span={2} offset={1}>
                                  <Button type={'primary'} onClick={onGeneratePythonScript}>Generate Script</Button>
                                </Col>
                                </Row>
                              </Form> 
                            </Card>
                          </p>
                          <Tabs tabPosition='left' defaultActiveKey="1" items={tabItems} onChange={onPrbChange} />
                          
                      </p>  

                    </Card> */}
                    <br/>
                  </div>
                }
              </Panel>
          {/* //END Knowledge Graph Section */}

            {/* //Workflow editor Section */}
            <Panel header="Workflow Editor" key="WE">
                  <WorkflowEditorComponent/>
            </Panel>
          {/* //END Workflow editor Section */}

          {/* //Elastic Search Section */}
          <Panel header="Elastic Search" key="ES">
                  <p>Elastic Search Section</p>
            </Panel>
          {/* //END Elastic Search Section */}

          {/* //Bucket Explorer Section */}
            <Panel header="S3 Bucket General" key="BM">
                <MarketPlaceComponent/>
            </Panel>
          {/* //END ML Marketplace Section */}

          
          {/* //ML Marketplace Section */}
          <Panel header="AI/ML Marketplace" key="ML">
              <p>Empty Section for now</p>
            </Panel>
          {/* //END ML Marketplace Section */}

          {/* //XR VR Section */}
          <Panel header="XR/VR" key="XR">
              <XrVrComponent/>
          </Panel>
          {/* //END ML Marketplace Section */}

           {/* //Fake Store Section */}
            <Panel header="Global Store Records" key="GS">
              <Row justify={'end'} style={{marginBottom: 10}}>
                    <Col span={3}>
                        <Space>
                            <Button type='primary' onClick={reloadData}>Reload</Button>
                            <Popconfirm
                                    title="Delete all store data"
                                    description="Are you sure to delete all the records found in the store?"
                                    onConfirm={DeleteStoreRecords}
                                    placement='bottom'
                                    okText="Yes"
                                    okType='danger'
                                    cancelText="No"
                                >
                                <Button danger={true}>Delete All</Button>
                            </Popconfirm>
                        </Space>
                    </Col>
                </Row>

                <SearchResults />
                <List
                  itemLayout="vertical"
                  loading={isSearching}
                  size="large"
                  pagination={{
                    onChange: (page) => {
                      console.log(page);
                    },
                    pageSize: 10,
                  }}
                  dataSource={datasetInformations}
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}

                    // about={item.datatypes}
                    // content={item.fileformats}
                    >
                      <List.Item.Meta
                        title={<Link onClick={(e) => onOpenDetailedDataset(item.id, item, e)}> {item.title} </Link>}
                        description={item.description}

                      />
                      {item.source} |
                      <span>
                        <i style={{ marginLeft: 15 }}>From Adam: </i>
                        {item.isfromadam === true && <Tag color={'green'} key="0"> YES</Tag>}
                        {item.isfromadam === false && <Tag color={'red'} key="1"> NO</Tag>}
                      </span>
                    </List.Item>
                  )}
                />
              </Card>
              <br />
            </div>
          }
          placement='right'
          closable={true}
          onClose={onClose}
          open={open}
          key={1}
          push={true}
          width={500}
        >
          <Card>
            <pre>{JSON.stringify(JSON.parse(selected.dummyRecordData), null, 2)}</pre>
          </Card>
        </Drawer>
      </MainLayout>
    </KgWorkflowContext.Provider>
  );
}
const mapStateToProps = (state) => {
  return {
    cart: state.cart.Carts,
    productsWF: state.products.items,
  };
};

const mapDispatchToProps = {
  AddCart,
  deleteItem,
  getItems,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardView);
