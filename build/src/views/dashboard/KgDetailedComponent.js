import {
  Modal,
  Button,
  Typography,
  Collapse,
  Row,
  Col,
  Input,
  Divider,
  Form,
  Tabs,
  Select,
  Card,
  Tag,
  DatePicker,
  Spin,
  TreeSelect,
  Space,
} from 'antd';
import React, { useState, useEffect, useContext } from 'react';
import { addAppCustomNotification } from '../../components/NotificationBox.js';
import { searchDataSetBreakdownPerIdWithOptionsAndPost, generateApiCallWithPost } from '../../services/kg_DataService';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'; // only needed if you use named timezones like 'Europe/London'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import PolygonMap from '../../components/polygonmaps/polygonMap';
import { KgWorkflowContext } from '../DashboardView.js';
import { addItem } from '../../redux/product/actions.js';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useKeycloak } from '@react-keycloak/web';

// Extend plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const { Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

function KgDetailedComponent(props) {
  const { datasetid, dataset, breakdown, persistentId, isopen, close, productsWF, sources } = props;

  const [form] = Form.useForm();
  const [dateform] = Form.useForm();
  const [dateformSentinel] = Form.useForm();

  const [pythonScriptWF, setPythonScriptWF] = useState(null);
  const [metaJSON, setMetaJson] = useState(null);
  const [generateScript, setGenerateScript] = useState(false);
  const [selectedPolygonDropdown, SetPolygonDropdown] = useState('');

  const [tabItems, SetTabItems] = useState([]);
  const [selectedMetaInfoFields, SetSelectedMetaInfoFields] = useState([]);
  const [selectedDownloadOption, SetSelectedDownloadOptions] = useState('');
  const [isReady, SetIsReady] = useState(false);

  const [geometry, setGeometry] = useState([]);
  const [selectedPolygon, setPolygon] = useState([]);
  const [removedPolygon, setRemovePolygon] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selectedPolygonDropdown[0]);
  const [adamProductList, SetAdamProductList] = useState([]);
  const [adamDownloadOptions, SetAdamDownloadOptions] = useState([]);
  const [filteredAdamData, SetFilteredAdamData] = useState([]);
  const [insituProducts, SetInsituProducts] = useState([]);
  const [selectedInsituProducts, setSelectedInsituProducts] = useState([]);
  const { tabSet } = useContext(KgWorkflowContext);
  const { keycloak } = useKeycloak();

    useEffect(() => {
      if(dataset.isfromadam){
        //SetIsReady(true);
        // SetAdamDates(dataset.temporal.map((elt) => {
        //   return dayjs(elt);
        // }));
        
        // SetAdamDownloadOptions([]);
        // SetAdamProductList([]);
      }
      else{

        SetAdamDownloadOptions(dataset.download_options);
        SetAdamProductList(dataset.cascader);
      }

  //     item.values.forEach((value, idx) => {
  //       acc[index].push({
  //         key: idx,
  //         value: value,
  //       });
  //     });
  //     return acc;
  //   }, {});
  //   for (var i in grouped) {
  //     var arrElement = grouped[i];
  //     var opt = {};

  //     for (let j = 0; j < arrElement.length; j++) {
  //       var element = arrElement[j];
  //       opt[element.key] = arrElement.filter((e) => e.key === element.key).map((e) => e.value);
  //     }

  //     opts.push({
  //       product_id: i,
  //       obj: opt,
  //     });
  //   }
  //   return opts;
  // };

  function findMatchingProducts(products, selectedMetaInfoFields) {
    const result = [];
    console.log(products);
    products.forEach((product) => {
      console.log(product);
      let qualifies = true;
      const filteredObj = {};
      // Iterate over each key in selectedMetaInfoFields
      for (const key in selectedMetaInfoFields) {
        const selectedValues = selectedMetaInfoFields[key];
        // Find the child object in product.children where value matches the key
        const child = product.children.find((c) => c.value === key);
        // Extract the values from the child's children array
        const childValues = child ? child.children.map((c) => c.value) : [];
        if (Array.isArray(selectedValues) && selectedValues.length > 0) {
          // Check if child exists and has values
          if (!child || !Array.isArray(childValues)) {
            qualifies = false;
            break;
          }
          // Check if all selected values exist in childValues (AND condition)
          for (const val of selectedValues) {
            if (!childValues.includes(val)) {
              qualifies = false;
              break;
            }
          }
          if (!qualifies) break;
          // Include only the selected values for the output
          filteredObj[key] = selectedValues;
        } else {
          // If nothing is selected for this key, pass through the available values
          filteredObj[key] = childValues;
        }
      }
      // If the product qualifies, add it to the results
      if (qualifies) {
        const productId = product.value;
        result.push({
          product_id: productId,
          obj: filteredObj,
        });
      }
    });
    return result;
  }

  const onGeneratePythonScript = () => {
    // Use your findMatchingProducts function to populate all_meta_infos
    const all_meta_infos = findMatchingProducts(breakdown.cascader, selectedMetaInfoFields);
    // If no matching products found, return early
    if (all_meta_infos.length === 0) {
      console.log('No matching products found');
      return;
    }

    var prodIds = all_meta_infos.map((el) => el.product_id);
    console.log(prodIds);
    let dates = getDateRange(dateform);

    let newBounds;
    if (
      sources.some((item) => item.toLowerCase() === 'silam') ||
      sources.some((item) => item.toLowerCase() === 'cmcc') ||
      sources.some((item) => item.toLowerCase() === 'destine')
    ) {
      const bounds = geometry[0].map(([lat, lng]) => [lat, lng]);
      bounds.push([geometry[0][0][0], geometry[0][0][1]]); // Close the geometry loop
      newBounds = [JSON.stringify([bounds])];
    }

    console.log(all_meta_infos);
    // Rest of your existing function remains unchanged
    for (let k = 0; k < all_meta_infos.length; k++) {
      var meta_info = all_meta_infos[k].obj;
      console.log(all_meta_infos[k].obj);
      console.log(k);
      if (
        sources.some((item) => item.toLowerCase() === 'silam') ||
        sources.some((item) => item.toLowerCase() === 'cmcc') ||
        sources.some((item) => item.toLowerCase() === 'destine') ||
        sources.some((item) => item.toLowerCase() === 'land') ||
        sources.some((item) => item.toLowerCase() === 'marine')
      ) {
        meta_info['Geometry'] = newBounds;
        meta_info['Date'] = dates.map((date) => date);
      }
      // Adding data fro product ads and eumetsat
      for (const key in selectedOptionsFromNotAdamOrSentinel) {
        if (!selectedOptionsFromNotAdamOrSentinel.hasOwnProperty(key)) continue;

        if (!meta_info[key]) {
          meta_info[key] = [...selectedOptionsFromNotAdamOrSentinel[key]];
        } else {
          for (const value of selectedOptionsFromNotAdamOrSentinel[key]) {
            if (!meta_info[key].includes(value)) {
              meta_info[key].push(value);
            }
          }
        }
      }
      if (sources.some((item) => item.toLowerCase() !== 'inspire')) {
        meta_info['ProductID'] = [prodIds[k]];
      }
      var bodyContent = {
        datasetId: datasetid,
        datasetPersistentId: persistentId,
        functionalOptions: {
          DownloadOption: [selectedDownloadOption],
        },
        requestOptions: meta_info,
      };
      console.log(meta_info);
      console.log('body content', bodyContent);

      generateApiCallWithPost(keycloak.token, datasetid, JSON.stringify(bodyContent))
        .then((response) => {
          var randomId = prodIds[k];
          let info = meta_info;
          setPythonScriptWF(response.payload);
          setMetaJson(JSON.stringify(info, null, 2));
          let tabComponent = {
            key: randomId,
            label: 'Product ' + randomId,

            children: (
              <>
                <Row>
                  <Col span={15}>
                    <Divider>
                      Python Script{' '}
                      <CopyToClipboard text={response.payload} onCopy={onCopyDefaultText}>
                        <CopyOutlined style={{ color: '#418cc0' }} />
                      </CopyToClipboard>
                    </Divider>
                    <pre style={{ maxHeight: 400, overflowY: 'scroll' }}>{response.payload}</pre>
                  </Col>
                  <Col span={8} offset={1}>
                    <Divider>
                      Meta Info (JSON){' '}
                      <CopyToClipboard text={JSON.stringify(info, null, 2)} onCopy={onCopyDefaultText}>
                        <CopyOutlined style={{ color: '#418cc0' }} />
                      </CopyToClipboard>
                    </Divider>
                    <pre style={{ maxHeight: 400, overflowY: 'scroll' }}>{JSON.stringify(info, null, 2)}</pre>
                  </Col>
                </Row>
                <Row justify={'center'}>
                  <Col span={24}></Col>
                </Row>
              </>
            ),
          };

          SetTabItems((current) => [...current, tabComponent]);
          setGenerateScript(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const BuildJsonMetaInfoForAdam = (values) => {
    var pIds = values;
    // return list;
    if (dataset.isfromadam || sources.some((item) => item.toLowerCase() === 'silam')) {
      console.log(values, 'kspm', filteredAdamData);
      return pIds.map((id) => {
        return filteredAdamData.find((p) => p.id.toString().toUpperCase() == id.toString().toUpperCase());
      });
    } else return filteredAdamData;
  };

  const onGenerateFromAdamPythonScript = () => {
    var all_meta_infos = [];

    SetTabItems([]);

    all_meta_infos = BuildJsonMetaInfoForAdam(selectedMetaInfoFields);

    const geometriesTemp = geometry;

    const extraInfo = {
      datasetId: datasetid,
      persistentId: persistentId,
      datasetName: dataset.title,
      description: dataset.description,
      variables: 'variables',
      fileformats: 'fileformats',
      geometry: geometriesTemp,
    };
    all_meta_infos.push({ extraInfo: extraInfo });

    const info = all_meta_infos.flat();
    console.log(JSON.stringify(info, null, 2));
    setMetaJson(JSON.stringify(info, null, 2));
    var bodyContent = {
      datasetId: datasetid,
      datasetPersistentId: persistentId,
      requestOptions: {
        ProductID: selectedMetaInfoFields,
        Compress: Array.of(selectedDownloadOption),
      },
    };
    generateApiCallWithPost(keycloak.token, datasetid, JSON.stringify(bodyContent))
      .then((response) => {
        console.log(response.payload);
        setPythonScriptWF(response.payload);
        setMetaJson(JSON.stringify(info, null, 2));

        let tabComponent = {
          key: 0,
          label: 'Product(s)',
          children: (
            <>
              <Row>
                <Col span={15}>
                  <Divider>
                    Python Script{' '}
                    <CopyToClipboard text={response.payload} onCopy={onCopyDefaultText}>
                      <CopyOutlined style={{ color: '#418cc0' }} />
                    </CopyToClipboard>
                  </Divider>
                  <pre style={{ maxHeight: 400, overflowY: 'scroll' }}>{response.payload}</pre>
                </Col>
                <Col span={8} offset={1}>
                  <Divider>
                    Meta Info (JSON){' '}
                    <CopyToClipboard text={JSON.stringify(info, null, 2)} onCopy={onCopyDefaultText}>
                      <CopyOutlined style={{ color: '#418cc0' }} />
                    </CopyToClipboard>
                  </Divider>
                  <pre style={{ maxHeight: 400, overflowY: 'scroll' }}>{JSON.stringify(info, null, 2)}</pre>
                </Col>
              </Row>
            </>
          ),
        };

        SetTabItems((current) => [...current, tabComponent]);
        setGenerateScript(true);
      })
      .catch((err) => {
        addAppCustomNotification('Dashboard KG', 'CRITICAL', 'Encounter an error!');
        console.log(err);
      });
  };
  const onGenerateFromSentinelPythonScript = () => {
    var all_meta_infos = [];
    SetTabItems([]);

    let dates = getDateRange(dateformSentinel);
    // Generate geometry bounds
    console.log(geometry);

    const bounds = geometry[0].map(([lat, lng]) => [lat, lng]);
    bounds.push([geometry[0][0][0], geometry[0][0][1]]); // Close the geometry loop
    const newBounds = [JSON.stringify([bounds])];

    var options = {
      id: datasetid,
      datasetPersistentId: persistentId,
      requestOptions: {
        Geometry: newBounds,

        Date: dates.map((date) => date),
      },
    };

    var all_meta_infos_temp = BuildJsonMetaInfoForAdam(selectedMetaInfoFields);
    all_meta_infos = [all_meta_infos_temp];

    const geometriesTemp = geometry;

    const extraInfo = {
      datasetId: datasetid,
      datasetName: dataset.title,
      description: dataset.description,
      variables: 'variables',
      fileformats: 'fileformats',
      geometry: geometriesTemp,
    };
    all_meta_infos.push({ extraInfo: extraInfo });
    const info = all_meta_infos.flat();

    setMetaJson(JSON.stringify(info, null, 2));
    generateApiCallWithPost(keycloak.token, datasetid, JSON.stringify(options))
      .then((response) => {
        console.log(response);
        setPythonScriptWF(response.payload);
        setMetaJson(JSON.stringify(info, null, 2));

        let tabComponent = {
          key: 0,
          label: 'Product(s)',
          children: (
            <>
              <Row>
                <Col span={15}>
                  <Divider>
                    Python Script{' '}
                    <CopyToClipboard text={response.payload} onCopy={onCopyDefaultText}>
                      <CopyOutlined style={{ color: '#418cc0' }} />
                    </CopyToClipboard>
                  </Divider>
                  <pre style={{ maxHeight: 400, overflowY: 'scroll' }}>{response.payload}</pre>
                </Col>
                <Col span={8} offset={1}>
                  <Divider>
                    Meta Info (JSON){' '}
                    <CopyToClipboard text={JSON.stringify(info, null, 2)} onCopy={onCopyDefaultText}>
                      <CopyOutlined style={{ color: '#418cc0' }} />
                    </CopyToClipboard>
                  </Divider>
                  <pre style={{ maxHeight: 400, overflowY: 'scroll' }}>{JSON.stringify(info, null, 2)}</pre>
                </Col>
              </Row>
            </>
          ),
        };

        SetTabItems((current) => [...current, tabComponent]);
        setGenerateScript(true);
      })
      .catch((err) => {
        addAppCustomNotification('Dashboard KG', 'CRITICAL', 'Encountered an error!');
        console.log(err);
      });
  };

  const onCreateWF = () => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    props.addItem({
      id: uuidv4(),
      quantity: 0,
      title: dataset.title,
      dateTime: new Date().toLocaleDateString('en-GB', options).replace(',', ''),
      metaJSON: metaJSON,
      pythonScript: pythonScriptWF,
      geometry: geometry,
    });
    onCloseModal();
    let kg = { tabId: ['WC'] };
    tabSet(kg);
  };

  const ValidateAdamFilter = () => {
    const today = dayjs(); // Get today's date

    let dates = getDateRange(dateform);

    const isInvalidEndDate = dayjs(dates[1]).isAfter(today);

    // Validate only the end date
    if (isInvalidEndDate) {
      const warningMessage = `Invalid Date range! End date should be on or before ${today.format('DD/MM/YYYY')}!`;
      addAppCustomNotification('Dashboard KG', 'WARNING', warningMessage);
      return; // Exit early if the date range is invalid
    }

    // Generate geometry bounds
    const bounds = geometry[0].map(([lat, lng]) => [lat, lng]);
    bounds.push([geometry[0][0][0], geometry[0][0][1]]); // Close the geometry loop
    const newBounds = [JSON.stringify([bounds])];

    // Prepare options
    const options = {
      id: datasetid,
      datasetPersistentId: persistentId,
      requestOptions: {
        Geometry: newBounds,
        Date: dates.map((date) => date),
      },
    };

    SetIsReady(true);

    // Fetch dataset
    searchDataSetBreakdownPerIdWithOptionsAndPost(keycloak.token, datasetid, JSON.stringify(options))
      .then((response) => {
        if (response.payload?.products?.length) {
          const productIds = response.payload.products.map((p) => ({
            label: p.id,
            value: p.id,
            title: p.id,
          }));

          const downloadOptions = [
            { label: 'True', value: 'True' },
            { label: 'False', value: 'False' },
          ];

          SetAdamProductList(productIds);
          SetAdamDownloadOptions(downloadOptions);
          SetFilteredAdamData(response.payload.products);
        } else {
          const noDataMessage = response.payload
            ? 'No dataset for this area! Please try with a different range of date or area!'
            : 'No dataset for this area!';
          addAppCustomNotification('Dashboard KG', 'WARNING', noDataMessage);
        }
        SetIsReady(false);
      })
      .catch((err) => {
        console.error(err);
        addAppCustomNotification('Dashboard KG', 'CRITICAL', 'Encountered an error!');
        SetIsReady(false);
      });
  };

  const onSelectAllOptions = () => {
    SetSelectedMetaInfoFields(adamProductList.map((item) => item.value));
  };

  const onDeselectAllOptions = () => {
    SetSelectedMetaInfoFields([]);
  };

  const onChangeTreeSelect = (ids) => {
    SetSelectedMetaInfoFields(ids);
  };
  const handleChange = (value) => {
    setSelectedOption(value);
    console.log('handle change here');
    console.log(value);

    if (value != '') {
      setPolygon(JSON.parse(value));
    } else {
      setPolygon([]);
      setRemovePolygon(false);
    }
  };
  const deleteAll = (value) => {
    setRemovePolygon(true);
    setSelectedOption(selectedPolygonDropdown[0]); // Reset to the first option
  };

  const handleProductChange = (field, newSelection) => {
    // Update the selection state
    const updatedSelected = { ...selectedOptionsFromNotAdamOrSentinel, [field]: newSelection };
    setSelectedOptionsFromNotAdamOrSentinel(updatedSelected);

    // Filter products: for each field with selection, keep only products
    // that have at least one value among the selected options
    SetSelectedMetaInfoFields(updatedSelected);
    const filteredProducts = productsFromNotAdamOrSentinel.filter((prod) => {
      // Assuming your products have an 'id' or 'name' for easy identification
      const productId = prod.id || prod.name || JSON.stringify(prod);

      const shouldIncludeProduct = Object.entries(updatedSelected).every(([attr, selected]) => {
        if (selected.length === 0) {
          return true;
        }
        if (!prod[attr] || !Array.isArray(prod[attr])) {
          return false; // Product FAILS if a selection exists but the attribute is missing/invalid
        }

        // Check 2b: Does the product's attribute array include any of the selected values?
        const isMatch = prod[attr].some((val) => selected.includes(val));
        return isMatch; // Product FAILS if no match is found
      });
      return shouldIncludeProduct;
    });

    // Compute available options for each attribute from the filtered products
    const newAvail = {};
    filteredProducts.forEach((prod) => {
      Object.entries(prod).forEach(([attr, values]) => {
        if (!newAvail[attr]) {
          newAvail[attr] = new Set();
        }
        values.forEach((val) => newAvail[attr].add(val));
      });
    });
    // Convert sets to arrays
    const newAvailArray = {};
    Object.entries(newAvail).forEach(([attr, setValues]) => {
      newAvailArray[attr] = Array.from(setValues);
    });
    setAvailableOptionsFromNotAdamOrSentinel(newAvailArray);
  };

  useEffect(() => {
    if (sources.some((item) => item.toLowerCase() === 'insitu')) {
      if (!breakdown.cascader || breakdown.cascader.length === 0) return;
      SetInsituProducts(breakdown.cascader);
      console.log(breakdown);
    } else if (!(dataset.isfromadam || dataset.isfromSentinel)) {
      if (!breakdown.cascader || breakdown.cascader.length === 0) return;

      const prodList = breakdown.cascader.map((product) => {
        const prodObj = {};
        product.children.forEach((child) => {
          prodObj[child.value] = child.children.map((grandChild) => grandChild.value);
        });
        return prodObj;
      });
      setProductsFromNotAdamOrSentinel(prodList);

      // Compute the initial union for each attribute over all products
      const allValues = {};
      prodList.forEach((prod) => {
        Object.entries(prod).forEach(([attr, values]) => {
          if (!allValues[attr]) {
            allValues[attr] = new Set();
          }
          values.forEach((val) => allValues[attr].add(val));
        });
      });
      // Convert sets to arrays
      const initAvailable = {};
      Object.entries(allValues).forEach(([attr, setValues]) => {
        initAvailable[attr] = Array.from(setValues);
      });
      setAvailableOptionsFromNotAdamOrSentinel(initAvailable);

      // Initialize selectedOptions (empty selections)
      const initSelected = {};
      Object.keys(initAvailable).forEach((attr) => {
        initSelected[attr] = [];
      });
      setSelectedOptionsFromNotAdamOrSentinel(initSelected);
    }
  }, [breakdown, dataset]);
  const handleInsituProductsChange = (values) => {
    setSelectedInsituProducts(values); // Update the state
  };

  return (
    <Modal
      title={
        <Row justify={'space-between'}>
          <Col span={15}>
            <Text strong style={{ color: '#418cc0', fontSize: 18 }}>
              {' '}
              {dataset.title}{' '}
            </Text>
          </Col>
          <Col span={6} offset={2}>
            {' '}
            <>
              {' '}
              {dataset.source} |
              <span>
                <i style={{ marginLeft: 15 }}>From Adam: </i>
                {dataset.isfromadam === true && (
                  <Tag color={'green'} key='0'>
                    {' '}
                    YES
                  </Tag>
                )}
                {dataset.isfromadam === false && (
                  <Tag color={'red'} key='1'>
                    {' '}
                    NO
                  </Tag>
                )}
              </span>
            </>
          </Col>
        </Row>
      }
      centered
      open={isopen}
      onCancel={onCloseModal}
      onOk={onCloseModal}
      destroyOnClose={true}
      maskClosable={false}
      width={1400}
      footer={[
        <Button type='primary' key='back' onClick={onCloseModal}>
          Close
        </Button>,
      ]}
    >
      <Divider />
      <Collapse defaultActiveKey={['0']}>
        <Panel header='Description' key='0'>
          {dataset.description}
        </Panel>
        <Panel header='File Formats' key='2'>
          {dataset.fileformats}
        </Panel>
        {(dataset.isfromadam ||
          dataset.isfromSentinel ||
          sources.some((item) => item.toLowerCase() === 'silam') ||
          sources.some((item) => item.toLowerCase() === 'cmcc') ||
          sources.some((item) => item.toLowerCase() === 'destine') ||
          sources.some((item) => item.toLowerCase() === 'land') ||
          sources.some((item) => item.toLowerCase() === 'marine')) && (
          <Panel header={'Advance Filter'} key='5'>
            <Row justify={'space-between'}>
              <Col span={24}>
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Geometry
                      <Space wrap>
                        <Button type='primary' danger icon={<DeleteOutlined />} onClick={deleteAll}>
                          Delete All
                        </Button>
                        <Select
                          style={{
                            width: 240,
                          }}
                          value={selectedOption}
                          onChange={handleChange}
                          options={selectedPolygonDropdown}
                        />{' '}
                      </Space>
                    </div>
                  }
                  bordered={false}
                >
                  {(dataset.isfromadam ||
                    sources.some((item) => item.toLowerCase() === 'silam') ||
                    sources.some((item) => item.toLowerCase() === 'cmcc') ||
                    sources.some((item) => item.toLowerCase() === 'destine')) && (
                    <PolygonMap
                      onGeometryChange={getGeometry}
                      removePolygons={getRemovePolygon}
                      deleteAll={removedPolygon}
                      selectedPolygon={selectedPolygon}
                      polygonCords={[]}
                      zoomSize={9}
                      drawing={true}
                      toBbox={false}
                    ></PolygonMap>
                  )}
                  {dataset.isfromSentinel && (
                    <PolygonMap
                      onGeometryChange={getGeometry}
                      removePolygons={getRemovePolygon}
                      selectedPolygon={selectedPolygon}
                      deleteAll={removedPolygon}
                      polygonCords={[]}
                      zoomSize={9}
                      drawing={true}
                      toBbox={true}
                    ></PolygonMap>
                  )}
                </Card>
              </Col>
              {dataset.isfromSentinel && (
                <Col span={24}>
                  getDateRange
                  <Card title='Dates' bordered={false}>
                    <span>Pick a Date Range: </span>
                    <Form form={dateformSentinel}>
                      <Form.Item name='daterange'>
                        <RangePicker
                          defaultValue={[dayjs('01/01/2024', 'DD/MM/YYYY'), dayjs('15/01/2024', 'DD/MM/YYYY')]}
                          format={'DD/MM/YYYY'}
                        />
                      </Form.Item>

                      {/* Evaluation Script Marios Ask me to hide it
                    <span>Evaluation Script: </span> */}
                      <Form.Item name='evalScript' style={{ display: 'none' }}>
                        <Input.TextArea rows={6} style={{ display: 'none' }} />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              )}
              {(dataset.isfromadam ||
                sources.some((item) => item.toLowerCase() === 'silam') ||
                sources.some((item) => item.toLowerCase() === 'cmcc') ||
                sources.some((item) => item.toLowerCase() === 'destine') ||
                sources.some((item) => item.toLowerCase() === 'land') ||
                sources.some((item) => item.toLowerCase() === 'marine')) && (
                <Col span={24}>
                  <Card title='Dates' bordered={false}>
                    <span>Pick a Date Range: </span>
                    <Form form={dateform}>
                      <Form.Item name={'daterange'}>
                        <RangePicker
                          defaultValue={[dayjs('01/01/2024', 'DD/MM/YYYY'), dayjs('15/01/2024', 'DD/MM/YYYY')]}
                          format={'DD/MM/YYYY'}
                        />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              )}
            </Row>
            <Row justify={'center'}>
              <Col span={2}>
                {dataset.isfromadam && (
                  <Button size={'large'} type={'default'} onClick={ValidateAdamFilter}>
                    Filter Now!
                  </Button>
                )}

                {/* {dataset.isfromSentinel && (
                                  <Button size={'large'} type={'default'} onClick={ValidateSentinelFilter}>
                                      Filter Now!
                                  </Button>
                              )} */}
              </Col>
            </Row>
          </Panel>
        )}
      </Collapse>
      <br />
      <Card title='Create Workflow'>
        <Spin spinning={isReady} tip='Please wait! We are fetching products in that area from the Knowledge graph...'>
          <Card>
            <Form form={form} name='advanced_filter'>
              <Row>
                {dataset.isfromadam && (
                  <>
                    <Col span={15}>
                      <TreeSelect
                        allowClear={true}
                        placeholder='Select Dataset Meta Info'
                        treeCheckable={true}
                        style={{
                          width: '100%',
                        }}
                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                        dropdownStyle={{ maxHeight: '400px' }}
                        onChange={(ids) => onChangeTreeSelect(ids)}
                        value={selectedMetaInfoFields}
                        maxTagCount={4}
                        maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} Products ...`}
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        showSearch={true}
                        treeData={[
                          {
                            title:
                              selectedMetaInfoFields.length > 0 ? (
                                <span
                                  onClick={onDeselectAllOptions}
                                  style={{
                                    display: 'inline-block',
                                    color: '#286FBE',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Unselect all
                                </span>
                              ) : (
                                <span
                                  onClick={onSelectAllOptions}
                                  style={{
                                    display: 'inline-block',
                                    color: '#286FBE',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Select all
                                </span>
                              ),
                            value: 'xxx',
                            disableCheckbox: true,
                            disabled: true,
                          },
                          ...adamProductList.map((item) => {
                            return { title: item.value, value: item.value };
                          }),
                        ]}
                      />
                    </Col>
                    <Col span={4} offset={1}>
                      <Form.Item name='Dataset Download Option'>
                        <Select
                          showSearch
                          placeholder='Select Download Option'
                          style={{ width: '100%' }}
                          disabled={!isopen}
                          optionFilterProp='children'
                          options={adamDownloadOptions}
                          onChange={onchangeDownloadOptions}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}
                {!(dataset.isfromadam || dataset.isfromSentinel) && (
                  <>
                    {Object.entries(availableOptionsFromNotAdamOrSentinel).map(([field, options]) => (
                      <div key={field} style={{ width: '100%', marginBottom: '1rem' }}>
                        <Form.Item name={field} label={field}>
                          <Select
                            mode='multiple'
                            placeholder={`Select options for ${field}`}
                            style={{ width: '100%' }}
                            value={selectedOptionsFromNotAdamOrSentinel[field]}
                            onChange={(values) => handleProductChange(field, values)}
                          >
                            {options.map((val) => (
                              <Select.Option key={val} value={val}>
                                {val}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    ))}
                    {sources.some((item) => item.toLowerCase() === 'insitu') && (
                      <Col span={5} offset={1}>
                        <Form.Item name='Dataset Download Option'>
                          <Select
                            mode='multiple'
                            showSearch // Allows searching through options
                            placeholder='Select In Situ Products'
                            style={{ width: '100%' }}
                            value={selectedInsituProducts} // Controlled component
                            onChange={handleInsituProductsChange}
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {insituProducts.map((product) => (
                              <Select.Option key={product.value} value={product.value} label={product.label}>
                                {product.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    {!sources.some((item) => item.toLowerCase() === 'silam') && (
                      <Col span={5} offset={1}>
                        <Form.Item name='Dataset Download Option'>
                          <Select
                            showSearch
                            placeholder='Select Download Option'
                            style={{ width: '100%' }}
                            disabled={!isopen}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={breakdown.download_options}
                            onChange={onchangeDownloadOptions}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </>
                )}

                <Col span={3} offset={1}>
                  {dataset.isfromadam && (
                    <Button type={'primary'} onClick={onGenerateFromAdamPythonScript}>
                      Generate Script
                    </Button>
                  )}
                  {dataset.isfromSentinel && (
                    <Button type={'primary'} onClick={onGenerateFromSentinelPythonScript}>
                      Generate Script
                    </Button>
                  )}
                  {!(dataset.isfromadam || dataset.isfromSentinel) && (
                    <Button type={'primary'} onClick={onGeneratePythonScript}>
                      Generate Script
                    </Button>
                  )}
                </Col>
              </Row>
              <br />
            </Form>
          </Card>
          <Tabs tabPosition='left' defaultActiveKey='1' items={tabItems} />
          {generateScript && (
            <>
              <Row justify={'center'}>
                <Col span={2}>
                  <Button type={'primary'} onClick={onCreateWF}>
                    Save Dataset
                  </Button>
                </Col>
              </Row>{' '}
            </>
          )}
        </Spin>
      </Card>
    </Modal>
  );
}

const mapStateToProps = (state) => {
  return {
    _products: state._todoProduct,
    productsWF: state.products.items,
  };
};
function mapDispatchToProps(dispatch) {
  return {
    addItem: (item) => dispatch(addItem(item)),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(KgDetailedComponent);
