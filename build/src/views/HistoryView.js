import React, { useState, useEffect } from 'react';
import { Card, Table, Drawer, Tag, Spin, Space, Typography, Button } from 'antd';
import { ClockCircleOutlined, LinkOutlined, InfoCircleOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import { getUserHistory } from '../services/userService';
import { useKeycloak } from '@react-keycloak/web';

const { Text } = Typography;

const HistoryView = () => {
  const { keycloak } = useKeycloak();
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const ShowInDrawer = (item) => {
    setSelectedItem(item);
    showDrawer();
  };

  const getColor = (status) => {
    if (status === 'OK - 200') return 'success';
    if (status.startsWith('4')) return 'warning';
    if (status.startsWith('5')) return 'error';
    return 'default';
  };

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'dateRecorded',
      key: 'dateRecorded',
      render: (date) => (
        <Space>
          <ClockCircleOutlined className='text-gray-400' />
          <Text>{new Date(date).toLocaleString()}</Text>
        </Space>
      ),
      width: '20%',
    },
    {
      title: 'API Request',
      dataIndex: 'requestURI',
      key: 'requestURI',
      render: (uri) => (
        <Space>
          <LinkOutlined className='text-gray-400' />
          <Text className='break-all'>{uri}</Text>
        </Space>
      ),
      width: '45%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getColor(status)} className='min-w-[90px] text-center'>
          {status}
        </Tag>
      ),
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          onClick={() => ShowInDrawer(record)}
          type='link' // or "primary" based on your design preference
          icon={<InfoCircleOutlined />}
        >
          Details
        </Button>
      ),
      width: '20%',
    },
  ];

  const fetchHistory = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await getUserHistory(keycloak.token, keycloak.subject, page, pageSize);
      setHistoryRecords(response.items);
      setPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.totalRecords,
      });
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleTableChange = (pagination) => {
    fetchHistory(pagination.current, pagination.pageSize);
  };

  return (
    <MainLayout menu='3'>
      <div className='max-w-7xl mx-auto p-6'>
        <Card
          title={
            <div className='flex items-center justify-between'>
              <Text strong className='text-2xl'>
                History
              </Text>
            </div>
          }
          className='shadow-md rounded-lg'
        >
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={historyRecords}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} records`,
              }}
              onChange={handleTableChange}
              rowKey={(record) => record.dateRecorded}
              className='overflow-x-auto'
              scroll={{ x: true }}
            />
          </Spin>
        </Card>

        <Drawer
          title={
            selectedItem && (
              <div className='space-y-3'>
                <Text strong className='text-lg block'>
                  Request Details
                </Text>
                <div className='space-y-2'>
                  <div className='text-sm text-gray-600 break-all'>{selectedItem.requestURI}</div>
                  <Space size='middle'>
                    <Tag color={getColor(selectedItem.status)} className='px-3 py-1'>
                      {selectedItem.status}
                    </Tag>
                    <Text type='secondary' className='text-sm'>
                      {new Date(selectedItem.dateRecorded).toLocaleString()}
                    </Text>
                  </Space>
                </div>
              </div>
            )
          }
          placement='right'
          closable={true}
          onClose={onClose}
          open={open}
          className='shadow-lg'
        >
          {selectedItem && (
            <Card className='border-none shadow-none'>
              <div className='space-y-2'>
                <Text strong className='text-sm text-gray-700'>
                  Response Data
                </Text>
                <pre className='mt-2 p-4 bg-gray-50 rounded-lg overflow-auto text-sm font-mono'>
                  {JSON.stringify(JSON.parse(selectedItem.historyData), null, 2)}
                </pre>
              </div>
            </Card>
          )}
        </Drawer>
      </div>
    </MainLayout>
  );
};

export default HistoryView;
