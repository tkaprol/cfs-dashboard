import React, { useState, useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Select,
  Form,
  Button,
  Modal,
  Spin,
  InputNumber,
  Space,
  Typography,
  Tooltip,
  Dropdown,
  DatePicker,
  Menu,
  Input,
} from 'antd';
import moment from 'moment';
import {
  PlusOutlined,
  CloseOutlined,
  DownloadOutlined,
  EditOutlined,
  LayoutOutlined,
  RedoOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import { useKeycloak } from '@react-keycloak/web';
import { getBucketFiles } from '../../services/S3BucketService';
import { addAppCustomNotification } from '../../components/NotificationBox';
import { getUserWorkflows } from '../../services/dsl_DataService';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getOpenSearchIndices, getOpenSearchIndiceMapping, getOpenSearchIndiceSearch } from '../../api/openSearchApi';

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

const DraggableChartCard = ({ chart, index, moveChart, renderChart, width, handleWidthChange }) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Determine if this is a 3D chart
  const is3DChart = chart.type === 'surface';

  const [{ handlerId }, drop] = useDrop({
    accept: 'chart',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveChart(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDraggingCard }, drag, preview] = useDrag({
    type: 'chart',
    item: () => {
      setIsDragging(true);
      return { id: chart.id, index };
    },
    end: () => {
      setIsDragging(false);
    },
    collect: (monitor) => ({
      isDraggingCard: monitor.isDragging(),
    }),
  });

  // Apply refs conditionally
  const applyDrag = (el) => {
    ref.current = el;
    preview(el);

    // Only make the header draggable, not the entire card
    // This way the chart interactions won't conflict
    if (!is3DChart) {
      drop(el);
    } else {
      // For 3D charts, we still want the drop functionality
      // but we'll make only the header draggable
      drop(el);
    }
  };

  // Handle finding and applying drag to just the header of the card
  useEffect(() => {
    if (ref.current && is3DChart) {
      // Find the card header element
      const header = ref.current.querySelector('.ant-card-head');
      if (header) {
        // Only make the header draggable
        drag(header);
      }
    } else if (ref.current) {
      // For non-3D charts, the entire card can be draggable
      drag(ref.current);
    }
  }, [drag, is3DChart, ref.current]);

  return (
    <Col span={width}>
      <div
        ref={applyDrag}
        style={{
          opacity: isDraggingCard ? 0.5 : 1,
          margin: '0 0 16px 0',
          cursor: isDraggingCard ? 'grabbing' : 'grab',
        }}
        data-handler-id={handlerId}
      >
        {renderChart(chart)}
      </div>
    </Col>
  );
};

const DataVisualizationV2 = () => {
  const [bucketFiles, setBucketFiles] = useState([]);
  const [charts, setCharts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedChartType, setSelectedChartType] = useState(null);
  const [fileColumns, setFileColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({ x: null, y: null, z: null });
  const [loading, setLoading] = useState(false);
  const [colorTheme, setColorTheme] = useState('default');
  const [form] = Form.useForm();
  const { keycloak } = useKeycloak();
  const [s3BucketOptions, setS3BucketOptions] = useState([]);
  const chartRefs = useRef({});
  const [editingChartId, setEditingChartId] = useState(null);
  const [chartWidths, setChartWidths] = useState({});
  const [xRange, setXRange] = useState(null);
  const [yRange, setYRange] = useState(null);
  const [zRange, setZRange] = useState(null);
  const [limit, setLimit] = useState(1000); // Default to 1000
  const [startFrom, setStartFrom] = useState(0);

  // Extended chart types
  const chartTypes = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'surface', label: '3D Surface' },
  ];

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await getUserWorkflows(keycloak.token);
        const buckets = response.map((bucket) => ({
          label: bucket.name,
          value: bucket.id,
        }));
        setS3BucketOptions(buckets);
      } catch (err) {
        addAppCustomNotification('Dashboard Data Visualization', 'CRITICAL', 'Encountered an error!');
        console.error('Error fetching workflows:', err);
      }
    };

    fetchWorkflows();
  }, [keycloak.token]);

  function handleFileColumns(data) {
    let columns = [];

    // Extract the actual index name which is the only key in the object
    const indexName = Object.keys(data)[0];

    if (data[indexName] && data[indexName].mappings && data[indexName].mappings.properties) {
      const properties = data[indexName].mappings.properties;

      for (const field in properties) {
        const fieldData = properties[field];
        // Create a column object with all available metadata
        const columnData = {
          name: field,
          type: fieldData.type || 'unknown',
        };
        // Extract meta data if available
        if (fieldData.meta) {
          columnData.min = fieldData.type === 'date' ? new Date(fieldData.meta.min) : Number(fieldData.meta.min);
          columnData.max = fieldData.type === 'date' ? new Date(fieldData.meta.max) : Number(fieldData.meta.max);
          columnData.value_count = Number(fieldData.meta.value_count) || 0;
        }
        columns.push(columnData);
      }
    }
    return columns;
  }

  const handleFileSelect = async (value) => {
    setSelectedFile(value);
    setLoading(true);
    try {
      console.log(value);
      const fileMappings = await getOpenSearchIndiceMapping(keycloak.token, value);
      const fileColumns = handleFileColumns(fileMappings);
      setFileColumns(fileColumns);
    } catch (error) {
      addAppCustomNotification('Data Visualization', 'ERROR', 'Failed to fetch file mappings');
    } finally {
      setLoading(false);
    }
  };

  const resetSelections = () => {
    setSelectedFile(null);
    setSelectedChartType(null);
    setSelectedColumns({ x: null, y: null, z: null });
    setXRange(null);
    setYRange(null);
    setZRange(null);
    setLimit(1000);
    setStartFrom(0);
  };

  const editChart = (chartId) => {
    const chartToEdit = charts.find((chart) => chart.id === chartId);
    if (chartToEdit) {
      setEditingChartId(chartId);
      setSelectedFile(chartToEdit.file.id);
      setSelectedChartType(chartToEdit.type);
      setSelectedColumns(chartToEdit.columns);
      setColorTheme(chartToEdit.colorTheme);
      // Re-fetch the file data
      handleFileSelect(chartToEdit.file.id);
      setModalVisible(true);
    }
  };

  const downloadChart = (chartId) => {
    const chartRef = chartRefs.current[chartId];
    if (chartRef) {
      const chartInstance = chartRef.getEchartsInstance();
      setTimeout(() => {
        const dataURL = chartInstance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff',
        });

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `chart-${chartId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 100);
    }
  };

  const removeChart = (chartId) => {
    setCharts(charts.filter((chart) => chart.id !== chartId));
    setChartWidths((prev) => {
      const updated = { ...prev };
      delete updated[chartId];
      return updated;
    });
  };

  const getEChartsOption = (chart) => {
    // For standard charts
    const formattedData = chart.data.map((row) => [row[chart.columns.x], parseFloat(row[chart.columns.y]) || 0]);

    // Base option for line, bar, scatter, area
    const baseOption = {
      title: {
        text:
          chart.type === 'pie'
            ? `${chart.file.id}: ${chart.columns.y} Distribution`
            : `${chart.file.id}: ${chart.columns.y} vs ${chart.columns.x}`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'value',
        name: chart.columns.x,
      },
      yAxis: {
        type: 'value',
        name: chart.columns.y,
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        containLabel: true,
      },
    };

    switch (chart.type) {
      case 'line':
        return {
          ...baseOption,
          series: [
            {
              data: formattedData,
              type: 'line',
              smooth: true,
            },
          ],
          yAxis: {
            type: 'value',
            min: chart.yRange[0],
            max: chart.yRange[1],
          },
          xAxis: {
            type: 'value',
            min: chart.xRange[0],
            max: chart.xRange[1],
          },
        };
      case 'bar':
        return {
          ...baseOption,
          series: [
            {
              data: formattedData,
              type: 'bar',
            },
          ],
          yAxis: {
            type: 'value',
            min: chart.yRange[0],
            max: chart.yRange[1],
          },
          xAxis: {
            type: 'value',
            min: chart.xRange[0],
            max: chart.xRange[1],
          },
        };
      case 'scatter':
        return {
          ...baseOption,
          series: [
            {
              data: formattedData,
              type: 'scatter',
            },
          ],
          yAxis: {
            type: 'value',
            min: chart.yRange[0],
            max: chart.yRange[1],
          },
          xAxis: {
            type: 'value',
            min: chart.xRange[0],
            max: chart.xRange[1],
          },
        };
      case 'pie': {
        // For pie charts, transform the data so that the first column is used as the name and the second as the value.
        const pieData = formattedData.map((item) => ({
          name: item[0],
          value: item[1],
        }));
        return {
          title: {
            text: `${chart.file.id}: ${chart.columns.y} Distribution`,
            left: 'center',
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: pieData.map((item) => item.name),
          },
          series: [
            {
              name: chart.columns.y,
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: pieData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        };
      }
      case 'area':
        return {
          ...baseOption,
          series: [
            {
              data: formattedData,
              type: 'line',
              smooth: true,
              areaStyle: {},
            },
          ],
          yAxis: {
            type: 'value',
            min: chart.yRange[0],
            max: chart.yRange[1],
          },
          xAxis: {
            type: 'value',
            min: chart.xRange[0],
            max: chart.xRange[1],
          },
        };
      case 'surface': {
        // Format data and filter out invalid points
        const formattedData = chart.data.map((row) => [
          row[chart.columns.x],
          parseFloat(row[chart.columns.y]),
          parseFloat(row[chart.columns.z]) || 0,
        ]);
        // Calculate min and max Z values
        const zValues = formattedData.map((point) => point[2]);
        const zMin = Math.min(...zValues);
        const zMax = Math.max(...zValues);

        return {
          title: {
            text: `${chart.file.id}: ${chart.columns.z} vs ${chart.columns.x} and ${chart.columns.y}`,
            left: 'center',
          },
          tooltip: {
            formatter: (params) => {
              const data = params.value;
              return `${chart.columns.x}: ${data[0]}<br>${chart.columns.y}: ${data[1]}<br>${chart.columns.z}: ${data[2]}`;
            },
          },
          visualMap: {
            min: zMin,
            max: zMax,
            dimension: 2, // Z-axis is the third value (index 2)
            inRange: {
              color: [
                '#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026',
              ],
            },
            text: ['High', 'Low'], // Labels for the color bar
            calculable: true, // Optional: allows users to adjust the range
          },
          xAxis3D: {
            type: 'value',
            name: chart.columns.x, // Label the X-axis
            min: Math.min(...chart.columns.x),
            max: Math.max(...chart.columns.x),
          },
          yAxis3D: {
            type: 'value',
            name: chart.columns.y, // Label the Y-axis
            min: Math.min(...chart.columns.y),
            max: Math.max(...chart.columns.y),
          },
          zAxis3D: {
            type: 'value',
            name: chart.columns.z, // Label the Z-axis
            min: Math.min(...chart.columns.z),
            max: Math.max(...chart.columns.z),
          },
          grid3D: {
            boxWidth: 200,
            boxHeight: 100, // Adjusted height for better proportion
            boxDepth: 200,
            viewControl: {
              autoRotate: false, // Stop auto-rotation for better control
              distance: 250, // Adjust zoom level
              alpha: 20, // Tilt angle
              beta: 40, // Rotation angle
            },
            light: {
              main: {
                intensity: 1.2, // Stronger main light
                shadow: true, // Add shadows for depth
              },
              ambient: {
                intensity: 0.3, // Soft ambient light
              },
            },
          },
          series: [
            {
              type: 'surface',
              wireframe: { show: true },
              shading: 'realistic',
              data: formattedData,
            },
          ],
        };
      }
      default:
        return baseOption;
    }
  };

  const renderChart = (chart) => {
    // Create a title that includes the chart type and file name.
    const chartTitle = `${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart - ${chart.file.id
      .split('-')
      .pop()}`;

    // Special handling for 3D surface charts
    const is3DChart = chart.type === 'surface';

    const chartContent = (
      <ReactECharts
        ref={(ref) => (chartRefs.current[chart.id] = ref)}
        option={getEChartsOption(chart)}
        style={{
          height: is3DChart ? 400 : 300, // Give more height to 3D charts
          pointerEvents: 'auto', // Ensure interactions work
        }}
        theme={chart.colorTheme === 'dark' ? undefined : chart.colorTheme}
        // Add specific props for 3D charts
        opts={is3DChart ? { renderer: 'canvas' } : undefined}
      />
    );

    // For 3D charts, we return just the chart content
    // The wrapper is handled by DraggableChartCard
    if (is3DChart) {
      return (
        <Card
          key={chart.id}
          style={{ marginBottom: 16, height: '100%' }}
          extra={
            <Space>
              <Dropdown overlay={layoutMenu(chart.id)} placement='bottomRight'>
                <Button type='text' icon={<LayoutOutlined />} title='Change Layout' />
              </Dropdown>
              <Button type='text' icon={<EditOutlined />} title='Edit Chart' onClick={() => editChart(chart.id)} />
              <Button
                type='text'
                icon={<DownloadOutlined />}
                title='Download Chart'
                onClick={() => downloadChart(chart.id)}
              />
              <Button type='text' icon={<CloseOutlined />} onClick={() => removeChart(chart.id)} title='Remove Chart' />
            </Space>
          }
          title={
            <div>
              <div>{chartTitle}</div>
              <Text type='secondary' style={{ fontSize: '12px' }}>
                {chart.columns.x} vs {chart.columns.y} vs {chart.columns.z} | {chart.data.length} data points
              </Text>
            </div>
          }
        >
          {chartContent}
        </Card>
      );
    }

    // For regular charts, return the full card
    return (
      <Card
        key={chart.id}
        style={{ marginBottom: 16, height: '100%' }}
        extra={
          <Space>
            <Dropdown overlay={layoutMenu(chart.id)} placement='bottomRight'>
              <Button type='text' icon={<LayoutOutlined />} title='Change Layout' />
            </Dropdown>
            <Button type='text' icon={<EditOutlined />} title='Edit Chart' onClick={() => editChart(chart.id)} />
            <Button
              type='text'
              icon={<DownloadOutlined />}
              title='Download Chart'
              onClick={() => downloadChart(chart.id)}
            />
            <Button type='text' icon={<CloseOutlined />} onClick={() => removeChart(chart.id)} title='Remove Chart' />
          </Space>
        }
        title={
          <div>
            <div>{chartTitle}</div>
            <Text type='secondary' style={{ fontSize: '12px' }}>
              {chart.columns.x} vs {chart.columns.y} | {chart.data.length} data points
            </Text>
          </div>
        }
      >
        {chartContent}
      </Card>
    );
  };

  const normalizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  const mergeFilesWithIndices = (files, openSearchfiles, bucketId) => {
    const combinedList = [];
    files.forEach((file) => {
      const normalizedName = `workflow-${bucketId}-${normalizeFilename(file.name)}`;
      const match = openSearchfiles.find((osFile) => osFile.index === normalizedName);
      if (match) {
        combinedList.push({
          ...file,
          ...match,
        });
      }
    });

    return combinedList;
  };

  const loadBucketFiles = async (bucketId) => {
    try {
      console.log(bucketId);
      const files = await getBucketFiles(keycloak.token, bucketId);
      const openSearchfiles = await getOpenSearchIndices(keycloak.token);
      const mergedData = mergeFilesWithIndices(files, openSearchfiles, bucketId);
      console.log(mergedData);
      setBucketFiles(mergedData);
    } catch (err) {
      console.error('Error loading bucket files:', err);
    }
  };

  const handleBucketChange = (value) => {
    loadBucketFiles(value);
  };

  const moveChart = (dragIndex, hoverIndex) => {
    const draggedChart = charts[dragIndex];
    const updatedCharts = [...charts];
    updatedCharts.splice(dragIndex, 1);
    updatedCharts.splice(hoverIndex, 0, draggedChart);
    setCharts(updatedCharts);
  };

  const handleWidthChange = (chartId, width) => {
    setChartWidths((prev) => ({
      ...prev,
      [chartId]: parseInt(width),
    }));
  };

  const layoutMenu = (chartId) => (
    <Menu onClick={({ key }) => handleWidthChange(chartId, key)}>
      <Menu.Item key='24'>Full Width</Menu.Item>
      <Menu.Item key='12'>Half Width</Menu.Item>
      <Menu.Item key='8'>One-Third Width</Menu.Item>
    </Menu>
  );

  // Reset and set ranges when X-axis column changes
  useEffect(() => {
    if (selectedColumns.x) {
      const xColumn = fileColumns.find((col) => col.name === selectedColumns.x);
      if (xColumn) {
        if (xColumn.type === 'date') {
          setXRange([xColumn.min ? moment(xColumn.min) : null, xColumn.max ? moment(xColumn.max) : null]);
        } else {
          setXRange([xColumn.min, xColumn.max]);
        }
      }
    } else {
      setXRange(null);
    }
  }, [selectedColumns.x, fileColumns]);
  // Reset and set ranges when Y-axis column changes
  useEffect(() => {
    if (selectedColumns.y) {
      const yColumn = fileColumns.find((col) => col.name === selectedColumns.y);
      if (yColumn) {
        if (yColumn.type === 'date') {
          setYRange([yColumn.min ? moment(yColumn.min) : null, yColumn.max ? moment(yColumn.max) : null]);
        } else {
          setYRange([yColumn.min, yColumn.max]);
        }
      }
    } else {
      setYRange(null);
    }
  }, [selectedColumns.y, fileColumns]);
  // Reset and set ranges when Z-axis column changes
  useEffect(() => {
    if (selectedColumns.z) {
      const zColumn = fileColumns.find((col) => col.name === selectedColumns.z);
      if (zColumn) {
        if (zColumn.type === 'date') {
          setZRange([zColumn.min ? moment(zColumn.min) : null, zColumn.max ? moment(zColumn.max) : null]);
        } else {
          setZRange([zColumn.min, zColumn.max]);
        }
      }
    } else {
      setZRange(null);
    }
  }, [selectedColumns.z, fileColumns]);

  const renderRangeInputs = (axis, columnName) => {
    const column = fileColumns.find((col) => col.name === columnName);
    if (!column) return null;

    // Choose the appropriate setter based on axis
    let setRange;
    let range;

    if (axis === 'x') {
      setRange = setXRange;
      range = xRange;
    } else if (axis === 'y') {
      setRange = setYRange;
      range = yRange;
    } else if (axis === 'z') {
      setRange = setZRange;
      range = zRange;
    }

    // Handle different column types
    if (column.type === 'date') {
      return (
        <Space direction='vertical' style={{ width: '100%' }}>
          <RangePicker
            value={range ? [moment(range[0]), moment(range[1])] : null}
            onChange={(dates) => setRange(dates ? [dates[0].toISOString(), dates[1].toISOString()] : null)}
            style={{ width: '100%' }}
          />
        </Space>
      );
    } else if (['double', 'float', 'integer', 'long'].includes(column.type)) {
      // Handle numeric fields
      return (
        <Space direction='vertical' style={{ width: '100%' }}>
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                placeholder='Min'
                style={{ width: '100%' }}
                min={column.min}
                max={column.max}
                value={range ? range[0] : undefined}
                onChange={(value) => setRange([value, range ? range[1] : column.max])}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                placeholder='Max'
                style={{ width: '100%' }}
                min={column.min}
                max={column.max}
                value={range ? range[1] : undefined}
                onChange={(value) => setRange([range ? range[0] : column.min, value])}
              />
            </Col>
          </Row>
        </Space>
      );
    } else {
      // For text or other types
      return (
        <Input
          placeholder='Enter a filter value'
          onChange={(e) => setRange([e.target.value, e.target.value])}
          value={range ? range[0] : ''}
        />
      );
    }
  };

  // Function to build OpenSearch query
  const buildOpenSearchQuery = () => {
    if (!selectedFile || !selectedColumns.x || !selectedColumns.y) {
      return {};
    }

    // Build the OpenSearch query
    let query = {
      query: {
        bool: {
          must: [],
        },
      },
      _source: [selectedColumns.x, selectedColumns.y],
      size: limit,
    };

    // If 3D Surface is selected and we have a Z column, include it in the source
    if (selectedChartType === 'surface' && selectedColumns.z) {
      query._source.push(selectedColumns.z);
    }

    // If no filters, use match_all
    if (
      (!xRange || (xRange[0] === null && xRange[1] === null)) &&
      (!yRange || (yRange[0] === null && yRange[1] === null)) &&
      (!zRange || (zRange[0] === null && zRange[1] === null))
    ) {
      query.query = { match_all: {} };
    } else {
      // Add X range filter if exists
      if (xRange && (xRange[0] !== null || xRange[1] !== null)) {
        const xRangeFilter = { range: { [selectedColumns.x]: {} } };
        if (xRange[0] !== null) xRangeFilter.range[selectedColumns.x].gte = xRange[0];
        if (xRange[1] !== null) xRangeFilter.range[selectedColumns.x].lte = xRange[1];
        query.query.bool.must.push(xRangeFilter);
      }

      // Add Y range filter if exists
      if (yRange && (yRange[0] !== null || yRange[1] !== null)) {
        const yRangeFilter = { range: { [selectedColumns.y]: {} } };
        if (yRange[0] !== null) yRangeFilter.range[selectedColumns.y].gte = yRange[0];
        if (yRange[1] !== null) yRangeFilter.range[selectedColumns.y].lte = yRange[1];
        query.query.bool.must.push(yRangeFilter);
      }

      // Add Z range filter if exists and chart type is 3D surface
      if (
        selectedChartType === 'surface' &&
        selectedColumns.z &&
        zRange &&
        (zRange[0] !== null || zRange[1] !== null)
      ) {
        const zRangeFilter = { range: { [selectedColumns.z]: {} } };
        if (zRange[0] !== null) zRangeFilter.range[selectedColumns.z].gte = zRange[0];
        if (zRange[1] !== null) zRangeFilter.range[selectedColumns.z].lte = zRange[1];
        query.query.bool.must.push(zRangeFilter);
      }
    }
    query.from = startFrom;

    return query;
  };

  // Update createChart to use the new query builder
  const createChart = async () => {
    if (
      !selectedFile ||
      !selectedColumns.x ||
      !selectedColumns.y ||
      (selectedChartType === 'surface' && !selectedColumns.z)
    ) {
      return;
    }

    setLoading(true);
    try {
      // Build the query using our helper function
      const query = buildOpenSearchQuery();

      // Execute the query
      const response = await getOpenSearchIndiceSearch(keycloak.token, selectedFile, query);
      console.log('OpenSearch response:', response);

      // Process the response
      let chartData = [];
      if (response && response.hits && response.hits.hits) {
        if (selectedChartType === 'surface') {
          console.log(response);
          // For 3D Surface charts, ensure we have numeric values for all axes
          chartData = response.hits.hits
            .map((hit) => {
              const source = hit._source;
              const x = parseFloat(source[selectedColumns.x]);
              const y = parseFloat(source[selectedColumns.y]);
              const z = parseFloat(source[selectedColumns.z]);

              // Only include points where all values are valid numbers
              if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                return {
                  [selectedColumns.x]: x,
                  [selectedColumns.y]: y,
                  [selectedColumns.z]: z,
                };
              }
              return null;
            })
            .filter((item) => item !== null);
        } else {
          // For other chart types
          chartData = response.hits.hits
            .filter((hit) => {
              const source = hit._source;
              return source[selectedColumns.x] !== undefined && source[selectedColumns.y] !== undefined;
            })
            .map((hit) => {
              const source = hit._source;
              return {
                [selectedColumns.x]: source[selectedColumns.x],
                [selectedColumns.y]: source[selectedColumns.y],
              };
            });
        }
      }

      // Create or update the chart
      if (editingChartId) {
        // Update existing chart
        setCharts((prevCharts) =>
          prevCharts.map((chart) => {
            if (chart.id === editingChartId) {
              return {
                ...chart,
                type: selectedChartType,
                file: { id: selectedFile },
                columns: selectedColumns,
                data: chartData,
                colorTheme: colorTheme,
                rowRange: [0, chartData.length],
                xRange: xRange,
                yRange: yRange,
                // Include zRange for 3D charts
                ...(selectedChartType === 'surface' && { zRange: zRange }),
              };
            }
            return chart;
          }),
        );
        setEditingChartId(null);
      } else {
        // Create new chart
        const newChart = {
          id: Date.now(),
          type: selectedChartType,
          file: { id: selectedFile },
          columns: selectedColumns,
          data: chartData,
          colorTheme: colorTheme,
          rowRange: [0, chartData.length],
          xRange: xRange,
          yRange: yRange,
          // Include zRange for 3D charts
          ...(selectedChartType === 'surface' && { zRange: zRange }),
        };
        setCharts([...charts, newChart]);
      }

      setModalVisible(false);
      resetSelections();
    } catch (error) {
      console.error('Error creating chart:', error);
      addAppCustomNotification('Data Visualization', 'ERROR', 'Failed to create chart: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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

          <Row>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Add Chart
            </Button>
          </Row>
        </Card>
      </Form>

      <Modal
        title={editingChartId ? 'Edit Chart' : 'Create New Chart'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingChartId(null);
          resetSelections();
        }}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              setModalVisible(false);
              setEditingChartId(null);
              resetSelections();
            }}
          >
            Cancel
          </Button>,
          <Button
            key='submit'
            type='primary'
            onClick={createChart}
            disabled={
              !selectedColumns.x || !selectedColumns.y || (selectedChartType === 'surface' && !selectedColumns.z)
            }
          >
            {editingChartId ? 'Update Chart' : 'Create Chart'}
          </Button>,
        ]}
        width={700}
        centered
        destroyOnClose
        bodyStyle={{ padding: '24px' }}
      >
        <Spin spinning={loading}>
          <Form layout='vertical'>
            {/* Select File */}
            <Form.Item label='Select File' required>
              <Select
                placeholder='Choose a file'
                value={selectedFile}
                onChange={handleFileSelect}
                style={{ width: '100%' }}
              >
                {bucketFiles.map((file) => (
                  <Option key={file.index} value={file.index}>
                    {file.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedFile && (
              <>
                {/* Chart Type */}
                <Form.Item label='Chart Type' required>
                  <Select
                    placeholder='Choose a chart type'
                    value={selectedChartType}
                    onChange={setSelectedChartType}
                    style={{ width: '100%' }}
                  >
                    {chartTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            {selectedChartType && (
              <>
                {/* X-Axis / Label Column */}
                <Form.Item label={selectedChartType === 'pie' ? 'Label Column' : 'X-Axis Column'} required>
                  <Select
                    placeholder='Select column for X-Axis / Label'
                    value={selectedColumns.x}
                    onChange={(value) => setSelectedColumns({ ...selectedColumns, x: value })}
                    style={{ width: '100%' }}
                  >
                    {fileColumns.map((column) => (
                      <Option key={column.name} value={column.name}>
                        {column.name} ({column.type})
                      </Option>
                    ))}
                  </Select>

                  {selectedColumns.x && (
                    <Card size='small' style={{ marginTop: '10px' }}>
                      <Row>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Type:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.x)?.type || 'Unknown'}
                        </Col>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Min:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.x)?.min?.toString() || 'N/A'}
                        </Col>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Max:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.x)?.max?.toString() || 'N/A'}
                        </Col>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Records:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.x)?.value_count?.toString() || 'N/A'}
                        </Col>
                      </Row>
                      <Row style={{ marginTop: '10px' }}>
                        <Col span={24}>
                          <Text strong>Filter Range:</Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>{renderRangeInputs('x', selectedColumns.x)}</Col>
                      </Row>
                    </Card>
                  )}
                </Form.Item>

                {/* Y-Axis / Value Column */}
                <Form.Item label={selectedChartType === 'pie' ? 'Value Column' : 'Y-Axis Column'} required>
                  <Select
                    placeholder='Select column for Y-Axis / Value'
                    value={selectedColumns.y}
                    onChange={(value) => setSelectedColumns({ ...selectedColumns, y: value })}
                    style={{ width: '100%' }}
                  >
                    {fileColumns.map((column) => (
                      <Option key={column.name} value={column.name}>
                        {column.name} ({column.type})
                      </Option>
                    ))}
                  </Select>

                  {selectedColumns.y && (
                    <Card size='small' style={{ marginTop: '10px' }}>
                      <Row>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Type:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.y)?.type || 'Unknown'}
                        </Col>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Min:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.y)?.min?.toString() || 'N/A'}
                        </Col>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Max:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.y)?.max?.toString() || 'N/A'}
                        </Col>
                        <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Text strong>Records:</Text>{' '}
                          {fileColumns.find((col) => col.name === selectedColumns.y)?.value_count?.toString() || 'N/A'}
                        </Col>
                      </Row>
                      <Row style={{ marginTop: '10px' }}>
                        <Col span={24}>
                          <Text strong>Filter Range:</Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>{renderRangeInputs('y', selectedColumns.y)}</Col>
                      </Row>
                    </Card>
                  )}
                </Form.Item>

                {/* Z-Axis Column - Only show for 3D Surface chart */}
                {selectedChartType === 'surface' && (
                  <Form.Item label='Z-Axis Column' required>
                    <Select
                      placeholder='Select column for Z-Axis'
                      value={selectedColumns.z}
                      onChange={(value) => setSelectedColumns({ ...selectedColumns, z: value })}
                      style={{ width: '100%' }}
                    >
                      {fileColumns.map((column) => (
                        <Option key={column.name} value={column.name}>
                          {column.name} ({column.type})
                        </Option>
                      ))}
                    </Select>

                    {selectedColumns.z && (
                      <Card size='small' style={{ marginTop: '10px' }}>
                        <Row>
                          <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Text strong>Type:</Text>{' '}
                            {fileColumns.find((col) => col.name === selectedColumns.z)?.type || 'Unknown'}
                          </Col>
                          <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Text strong>Min:</Text>{' '}
                            {fileColumns.find((col) => col.name === selectedColumns.z)?.min?.toString() || 'N/A'}
                          </Col>
                          <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Text strong>Max:</Text>{' '}
                            {fileColumns.find((col) => col.name === selectedColumns.z)?.max?.toString() || 'N/A'}
                          </Col>
                          <Col span={6} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Text strong>Records:</Text>{' '}
                            {fileColumns.find((col) => col.name === selectedColumns.z)?.value_count?.toString() ||
                              'N/A'}
                          </Col>
                        </Row>
                        <Row style={{ marginTop: '10px' }}>
                          <Col span={24}>
                            <Text strong>Filter Range:</Text>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>{renderRangeInputs('z', selectedColumns.z)}</Col>
                        </Row>
                      </Card>
                    )}
                  </Form.Item>
                )}

                {/* Data Limit */}
                <Form.Item label='Number of data points to retrieve'>
                  <InputNumber
                    min={1}
                    max={1000000}
                    value={limit}
                    onChange={setLimit}
                    addonAfter={
                      <Tooltip title='Higher values may affect performance'>
                        <InfoCircleOutlined />
                      </Tooltip>
                    }
                  />
                </Form.Item>

                {/* Start From Value */}
                <Form.Item label='Start from value'>
                  <InputNumber min={0} value={startFrom} onChange={setStartFrom} />
                </Form.Item>
              </>
            )}
          </Form>
        </Spin>
      </Modal>
      <DndProvider backend={HTML5Backend}>
        {charts.length === 0 ? (
          <Card>
            <Text type='secondary'>
              No charts created yet. Use the "Add Chart" button to create a new visualization.
            </Text>
          </Card>
        ) : (
          <Row gutter={16}>
            {charts.map((chart, index) => (
              <DraggableChartCard
                key={chart.id}
                chart={chart}
                index={index}
                moveChart={moveChart}
                renderChart={renderChart}
                width={chartWidths[chart.id] || 24}
                handleWidthChange={handleWidthChange}
              />
            ))}
          </Row>
        )}
      </DndProvider>
    </div>
  );
};

export default DataVisualizationV2;
