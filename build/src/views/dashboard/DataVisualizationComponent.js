import { InboxOutlined ,EllipsisOutlined,ExpandOutlined } from '@ant-design/icons';
import { message, Table, Upload, Row, Col, Card, Divider, Button, Select, Spin, Form, Modal} from 'antd';
import React, { useState, useEffect} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Sector, Cell, BarChart, Bar,Label} from 'recharts';
import { showErrorMessage, tableColumnsBuilderFromArray, tableDatasourceBuilderFromArray } from '../common/utils';
import { getAllS3Bucket, parseFileDefinition } from '../services/S3BucketService';
import { Interweave, Markup } from 'interweave';
import CustomBarChart from './graphs/CustomBarchart';
import CustomLineChart from './graphs/CustomLineChart';
import CustomRadarChart from './graphs/CustomRadarChart';
import CustomPieChart from './graphs/CustomPieChart';
import DraggableCard from './DraggableCard';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useKeycloak } from '@react-keycloak/web';

import GridLayout from 'react-grid-layout';
import { addWorkflow, emptyWorkflow, getWorkflow } from '../../redux/workflow/actions';
import {
  receiveELK,
  receiveMessage,
  requestElkData,
  connectSocket,
  authenticate,
  joinChannel,
  leaveChannel,
} from '../../redux/socket/actions';

import { connect } from 'react-redux';

const { Dragger } = Upload;
const { Meta } = Card;
const ResponsiveGridLayout = WidthProvider(Responsive);

function DataVisualization({
  addWorkflow,
  emptyWorkflow,
  authenticate,
  joinChannel,
  leaveChannel,
  currentWorkflow,
  messagesKafka,
  messagesInit,
  messagesElk,
  messagesChartConfig,
  requestElkData,
}) {
  //.then function
  const [fdstate, setFdState] = useState(false);
  const [fdcstate, setfdcState] = useState(false);
  const [allstate, setAllState] = useState(false);

  // Modal
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);

  const [showVisuals, setShowVisuals] = useState(false);
  const [showVisualconf, setShowVisualconf] = useState(false);
  const [proceed, setProceed] = useState(false);

  const [tableColumns, setTableColumns] = useState([]);
  const [tableDatasource, setTableDatasource] = useState([]);

  //Visualization Configuration
  const [fileData, setFileData] = useState([]);
  const [fileDef, setFileDef] = useState({});

  const [tableColumnconf, setTableColumnconf] = useState([]);
  const [tableDatasourceconf, setTableDatasourceconf] = useState([]);
  const [fileDataconf, setFileDataconf] = useState([]);

  //Bar Data Test
  const [barData, setBarData] = useState([]);
  const [barConfig, setBarConfig] = useState({});
  const [barChartHtml, setBarChartHtml] = useState('');

  //Line Data Test
  const [lineData, setLineData] = useState([]);
  const [lineConfig, setLineConfig] = useState({});
  const [lineChartHtml, setLineChartHtml] = useState('');

  //Radar Data Test
  const [radarData, setRadarData] = useState([]);
  const [radarConfig, setRadarConfig] = useState({});
  const [radarChartHtml, setRadarChartHtml] = useState('');

  //Pie Data Test
  const [pieData, setPieData] = useState([]);
  const [pieConfig, setPieConfig] = useState({});
  const [pieChartHtml, setPieChartHtml] = useState('');

  //S3b buckets
  const [buckets, setBuckets] = useState([]);
  const [selectedBucketName, setSelectedBucketName] = useState('');
  const [bucketFiles, setBucketFiles] = useState([]);
  const [bucketConfigFiles, setBucketConfigFiles] = useState([]);
  const [s3BucketOptions, setS3BucketOptions] = useState([]);

  //Files Selectors
  const [selectedFileDataName, SetSelectedFileDataName] = useState('');
  const [selectedFileDefName, SetSelectedFileDefName] = useState('');
  const [selectedFileVisualName, SetSelectedFileVisualName] = useState('');

  const [isAnyBucketComponentLoading, setIsAnyBucketComponentLoading] = useState(true);
  const { keycloak } = useKeycloak();

  //Button

  const [dragButtonColor1, setDragButtonColor1] = useState('primary');
  const [dragButtonColor2, setDragButtonColor2] = useState('primary');
  const [dragButtonColor3, setDragButtonColor3] = useState('primary');

  useEffect(() => {
    setBucketFiles([]);
  }, []);

  useEffect(() => {
    connectSocket();
    authenticate(keycloak.token);

    // Add click event listener when component mounts
    return () => {
      if (currentWorkflow !== '') {
        leaveChannel(currentWorkflow);
      }
    };
  }, [connectSocket, authenticate, joinChannel, leaveChannel, currentWorkflow]);
  useEffect(() => {
    setSelectedBucketName(currentWorkflow);
    const file_vis = {
      author: 'Stephane',
      id: 'value',
      name: 'value',
      timestamp: 'value',
      chart_types: ['bar', 'line', 'radar'],
      visualized_data: ['x [m]', 'name', 'y [m]', 'cfactor'],
      legend: false,
      hasTooltip: false,
      isAnimated: true,
      mainAxis: 'name',
    };
    setFileDataconf(file_vis);
    const initMsg = messagesInit[messagesInit.length - 1];
    const kafkaMsg = messagesKafka[messagesKafka.length - 1];
    const elkMsg = messagesElk[messagesElk.length - 1];
    const chartConfig = messagesChartConfig[messagesChartConfig.length - 1];

    setBucketFiles([]);

    if (kafkaMsg && bucketFiles.length == 0) {
      const files = kafkaMsg['dataset_meta_info']['meta_information'][0]['metadata'].map((item) => ({
        label: item['index'],
        value: item['index'],
      }));
      setProceed(false);

      setFdState(false);
      setShowVisuals(false);
      setBucketFiles(files);
      SetSelectedFileDataName('');
      setIsAnyBucketComponentLoading(false);
    } else if (kafkaMsg && !elkMsg) {
      const uploadedfiles = kafkaMsg['dataset_meta_info']['meta_information'][0]['metadata'];
      const files = uploadedfiles.map((item) => ({
        label: item['index'],
        value: item['index'],
      }));
      setBucketFiles(files);
      setIsAnyBucketComponentLoading(false);
      if (selectedFileDataName) {
        const axios_config = {
          url: '/' + selectedFileDataName + '/_search',
          method: 'get',
          baseURL: initMsg['elastic_host'],
          auth: {
            username: initMsg['els_username'],
            password: initMsg['els_password'],
          },
          query: {
            size: 10000,
            query: {
              match_all: {},
            },
          },
        };

        requestElkData(JSON.stringify(axios_config));
      }
    } else if (elkMsg) {
      var columns = tableColumnsBuilderFromArray(elkMsg);
      var datasource = tableDatasourceBuilderFromArray(elkMsg);

      setTableColumns(columns);
      setTableDatasource(datasource);
      //setFileDataconf(response);
      setFileData(elkMsg);
      setBarData(elkMsg);
      setBarConfig(chartConfig);
      setLineConfig(chartConfig);
      setLineData(elkMsg);
      setRadarData(elkMsg);
      setRadarConfig(chartConfig);
      setProceed(true);
      setFdState(true);
      setShowVisuals(true);
    } else {
      setBucketFiles([]);
      setIsAnyBucketComponentLoading(false);
    }
    console.log('useEffect triggered');
    console.log('currentWorkflow:', selectedBucketName);
    console.log('messagesKafka:', messagesKafka);
    console.log('messagesElk:', messagesElk);
    console.log('messagesInit:', messagesInit);
    console.log('messagesChartConfig:', messagesChartConfig);
    console.log('selectedFileDataName:', selectedFileDataName);
    console.log('requestElkData:', requestElkData);
  }, [selectedBucketName, messagesKafka, messagesElk, messagesInit, messagesChartConfig, selectedFileDataName, requestElkData]);

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

  const SpecialTips = ({ children }) => {
    return <i style={{ fontSize: 10 }}>{children}</i>;
  };

  const style = {
    padding: '8px 0',
    height: '450px',
  };

  const isBucketSelected = () => {
    if (selectedBucketName.length === 0) {
      return false;
    } else {
      return true;
    }
  };

  const [form] = Form.useForm();

  const LoadBucketFiles = (name) => {
    console.log(name)
    setIsAnyBucketComponentLoading(true);
    getBucketFiles(keycloak.token, name).then((resp) => {
      console.log(resp)
      var items = resp;

      var files = [];

      var configFiles = [];

      for (let index = 0; index < items.length; index++) {
        var folderNames = items[index].name.split('/');
        var fileName = folderNames[folderNames.length - 1];

        if (
          fileName.toLowerCase().includes('.json') ||
          fileName.toLowerCase().includes('.csv') ||
          fileName.toLowerCase().includes('.xml')
        ) {
          files.push({
            label: items[index].name,
            value: items[index].name,
          });
        }

        if (fileName.toLowerCase().includes('.json')) {
          configFiles.push({
            label: items[index].name,
            value: items[index].name,
          });
        }
      }
      setBucketFiles([]);
      setBucketFiles(files);
      setBucketConfigFiles(configFiles);
      setIsAnyBucketComponentLoading(false);
    });
  };

  const onSelectBucket = (value) => {
    setSelectedBucketName(value);
    LoadBucketFiles(value);
  };

  const onchangeSelectedFileData = (value) => {
    const initMsg = messagesInit[messagesInit.length - 1];

    SetSelectedFileDataName(value);
    if (value) {
      const axios_config = {
        url: '/' + value + '/_search',
        method: 'get',
        baseURL: initMsg['elastic_host'],
        auth: {
          username: initMsg['els_username'],
          password: initMsg['els_password'],
        },
      };

      requestElkData(JSON.stringify(axios_config));
    }
  };

  const onchangeSelectedFileDef = (value) => {
    SetSelectedFileDefName(value);
  };

  const onchangeSelectedFileVisual = (value) => {
    SetSelectedFileVisualName(value);
  };

  const onValidateBucketFields = () => {
    //Set File Data
    if (selectedFileDataName.length > 0 && selectedFileDataName.trim() !== '') {
      getFileContentFromBucket(keycloak.token, selectedBucketName, selectedFileDataName)
        .then((response) => {
          setShowVisuals(true);

          var columns = tableColumnsBuilderFromArray(response);
          var datasource = tableDatasourceBuilderFromArray(response);

          setTableColumnconf(columns);
          setTableDatasourceconf(datasource);
          //setFileDataconf(response);
          setFileData(response);
        })
        .catch((error) => {
          addAppCustomNotification('Bucket', 'CRITICAL', 'Cannot fetch file content!');
          console.log(error);
        });
    }

    //Set File Def
    if (selectedFileDefName === '') {
      var datafile = GenerateFileDefinition(fileData);
      setFileDef(datafile);
    } else {
      getFileContentFromBucket(keycloak.token, selectedBucketName, selectedFileDefName)
        .then((response) => {
          setFileDef(response);
        })
        .catch((error) => {
          addAppCustomNotification('Bucket', 'CRITICAL', 'Cannot fetch file content!');
          console.log(error);
        });
    }

    if (selectedFileVisualName.length > 0 && selectedFileVisualName.trim() !== '') {
      //Set File Visualization
      getFileContentFromBucket(keycloak.token, selectedBucketName, selectedFileVisualName)
        .then((response) => {
          if (!Array.isArray(response)) {
            var r = [];
            r.push(response);
            setFileDataconf(r);
            setfdcState(true);
          } else {
            setFileDataconf(response);
          }
        })
        .catch((error) => {
          addAppCustomNotification('Bucket', 'CRITICAL', 'Cannot fetch file content!');
          console.log(error);
        });
    }
  };

  useEffect(() => {
    if (fdcstate === true && fdstate === true) {
      var datafile = GenerateFileDefinition(fileData);
      setFileDef(datafile);
      setAllState(true);
    }
  }, [fdcstate, fdstate]);

  useEffect(() => {
    if (allstate === true) {
      setProceed(true);
      var configs = {
        datafile: fileDef,
        visualfile: fileDataconf[0],
      };
      var sdata = JSON.stringify(configs);
      console.log('////////////////////////////////////////////////////');
      console.log(sdata);
      console.log('////////////////////////////////////////////////////');

      parseFileDefinition(keycloak.token, sdata)
        .then((resp) => {
          if (
            resp.barChartDetails !== null &&
            resp.barChartDetails.hasOwnProperty('barData') &&
            resp.barChartDetails.hasOwnProperty('html') &&
            resp.barChartDetails.hasOwnProperty('chartConfig')
          ) {
            setBarData(resp.barChartDetails.barData);
            setBarChartHtml(resp.barChartDetails.html);
            setBarConfig(resp.barChartDetails.chartConfig);
          } else {
            setBarChartHtml('');
          }

          if (
            resp.lineChartDetails !== null &&
            resp.lineChartDetails.hasOwnProperty('lineData') &&
            resp.lineChartDetails.hasOwnProperty('html') &&
            resp.lineChartDetails.hasOwnProperty('chartConfig')
          ) {
            setLineData(resp.lineChartDetails.lineData);
            setLineChartHtml(resp.lineChartDetails.html);
            setLineConfig(resp.lineChartDetails.chartConfig);
          } else {
            setLineChartHtml('');
          }

          if (
            resp.radarChartDetails !== null &&
            resp.radarChartDetails.hasOwnProperty('radarData') &&
            resp.radarChartDetails.hasOwnProperty('html') &&
            resp.radarChartDetails.hasOwnProperty('chartConfig')
          ) {
            setRadarData(resp.radarChartDetails.radarData);
            setRadarChartHtml(resp.radarChartDetails.html);
            setRadarConfig(resp.radarChartDetails.chartConfig);
          } else {
            setRadarChartHtml('');
          }

          if (
            resp.pieChartDetals !== null &&
            resp.pieChartDetals.hasOwnProperty('pieData') &&
            resp.pieChartDetals.hasOwnProperty('html') &&
            resp.pieChartDetals.hasOwnProperty('chartConfig')
          ) {
            setPieData(resp.pieChartDetals.pieData);
            setPieChartHtml(resp.pieChartDetals.html);
            setPieConfig(resp.pieChartDetals.chartConfig);
          } else {
            setPieChartHtml('');
          }
        })
        .catch((err) => {
          console.log(err);
          addAppCustomNotification('Bucket', 'CRITICAL', 'Oups! Something went wrong here!');
        });

      setFdState(false);
      setfdcState(false);
      setAllState(false);
    }
  }, [allstate]);

  const onResetBucketFields = () => {
    form.resetFields();
    addAppCustomNotification('Bucket', 'SUCCESS', 'Reset!');
  };

  // send file_defination
  const SendFileDefinition = () => {
    if (showVisuals) {
      var datafile = GenerateFileDefinition(fileData);
      var fileVisual = fileDataconf[0];

      var configs = {
        datafile: datafile,
        visualfile: fileVisual,
      };

      var sdata = JSON.stringify(configs);

      parseFileDefinition(keycloak.token, sdata)
        .then((resp) => {
          if (
            resp.barChartDetails !== null &&
            resp.barChartDetails.hasOwnProperty('barData') &&
            resp.barChartDetails.hasOwnProperty('html') &&
            resp.barChartDetails.hasOwnProperty('chartConfig')
          ) {
            setBarData(resp.barChartDetails.barData);
            setBarChartHtml(resp.barChartDetails.html);
            setBarConfig(resp.barChartDetails.chartConfig);
          } else {
            setBarChartHtml('');
          }

          if (
            resp.lineChartDetails !== null &&
            resp.lineChartDetails.hasOwnProperty('lineData') &&
            resp.lineChartDetails.hasOwnProperty('html') &&
            resp.lineChartDetails.hasOwnProperty('chartConfig')
          ) {
            setLineData(resp.lineChartDetails.lineData);
            setLineChartHtml(resp.lineChartDetails.html);
            setLineConfig(resp.lineChartDetails.chartConfig);
          } else {
            setLineChartHtml('');
          }

          if (
            resp.radarChartDetails !== null &&
            resp.radarChartDetails.hasOwnProperty('radarData') &&
            resp.radarChartDetails.hasOwnProperty('html') &&
            resp.radarChartDetails.hasOwnProperty('chartConfig')
          ) {
            setRadarData(resp.radarChartDetails.radarData);
            setRadarChartHtml(resp.radarChartDetails.html);
            setRadarConfig(resp.radarChartDetails.chartConfig);
          } else {
            setRadarChartHtml('');
          }

          if (
            resp.pieChartDetals !== null &&
            resp.pieChartDetals.hasOwnProperty('pieData') &&
            resp.pieChartDetals.hasOwnProperty('html') &&
            resp.pieChartDetals.hasOwnProperty('chartConfig')
          ) {
            setPieData(resp.pieChartDetals.pieData);
            setPieChartHtml(resp.pieChartDetals.html);
            setPieConfig(resp.pieChartDetals.chartConfig);
          } else {
            setPieChartHtml('');
          }
        })
        .catch((err) => {
          console.log(err);
          addAppCustomNotification('Bucket', 'CRITICAL', 'Oups! Something went wrong here!');
        });
    }
  };

  const GenerateFileDefinition = (fileData) => {
    let datafile = {
      id: '',
      name: '',
      timestamp: '',
      type: '',
      data: null,
      found_in_buckets: [''],
    };

    var data = [];
    for (var i = 0; i < Object.keys(fileData).length; i++) {
      for (var m = 0; m < Object.keys(fileData[i]).length; m++) {
        var obj = {
          id: i,
          name: Object.keys(fileData[i])[m],
          timestamp: 'DATE TIME VALUE',
          type: typeof Object.values(fileData[i])[m],
          value: Object.values(fileData[i])[m].toString(),
          unit_of_measure: 'UNIT OF MEASURE',
        };
        data.push(obj);
      }
    }
    datafile.data = data;

    return datafile;
  };

  const handleCancel = () => {
    setIsOpen1(false);
    setIsOpen2(false);
    setIsOpen3(false);
    setIsOpen4(false);
  };

  const handleOk = () => {
    setIsOpen1(false);
    setIsOpen2(false);
    setIsOpen3(false);
    setIsOpen4(false);
  };

  let [layouts, setLayouts] = useState([
    { i: 'Bar Chart', x: 0, y: 0, w: 2, h: 12.5, minH: 7, isBounded: true, isDraggable: false },
    { i: 'Line Chart', x: 6, y: 5, w: 2, h: 12.5, minH: 7, isBounded: true, isDraggable: false },
    { i: 'Radar Chart', x: 0, y: 6, w: 2, h: 12.5, minH: 7, isBounded: true, isDraggable: false },
  ]);

  const onDragCard = (value) => {
    switch (value) {
      case 1:
        setDragButtonColor1('danger');
        setDragButtonColor2('primary');
        setDragButtonColor3('primary');
        break;
      case 2:
        setDragButtonColor1('primary');
        setDragButtonColor2('danger');
        setDragButtonColor3('primary');
        break;
      case 3:
        setDragButtonColor1('primary');
        setDragButtonColor2('primary');
        setDragButtonColor3('danger');
        break;
      default:
        return null;
    }
    layouts = layouts.map((layout, index) => ({
      ...layout,
      isDraggable: index === value - 1 ? true : false,
    }));
    setLayouts(layouts);

        { proceed?
        <Row
          gutter={[16,16]}
        >
          {/* <Interweave transform={onTransformBarchart} content={barChartHtml}/>

          <Interweave transform={onTransformLinechart} content={lineChartHtml}/> */}

              handleOk={handleOk}
              handleCancel={handleCancel}
              dragButtonColor={dragButtonColor3}

              />
            </div>
            <div key='Radar Chart'>
              <DraggableCard
                title='Radar Chart'
                onExpand={() => setIsOpen3(true)}
                content={{ transform: onTransformRadarchart, html: radarChartHtml }}
                isOpen={isOpen3}
                showVisuals={showVisuals}
                onDragCard={() => onDragCard(3)}
                handleOk={handleOk}
                handleCancel={handleCancel}
                dragButtonColor={dragButtonColor3}
                chartData={radarData}
                chartType={'radar'}
                chartConfig={radarConfig}
                  
              />
            </div>
            <div key="Line Chart">

              <DraggableCard
                title="Line Chart Chart"
                onExpand={() => setIsOpen2(true)}
                onDragCard={() => onDragCard(2)}
                isOpen={isOpen1}
                showVisuals={showVisuals}
                handleOk={handleOk}
                handleCancel={handleCancel}
                dragButtonColor={dragButtonColor2}
                chartData={lineData}
                chartType={'line'}
                chartConfig={lineConfig}>

          </GridLayout>
        </div>
      )}
      <br />
      <Row>
        <Col span={24}>
          {showVisuals && (
            <>
              <Divider>Tabular View</Divider>
              <Table columns={tableColumns} dataSource={tableDatasource}></Table>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export default UploadComponent;
