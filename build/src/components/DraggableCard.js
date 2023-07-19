// DraggableCard.js
import React from 'react';
import { ExpandOutlined, DragOutlined } from '@ant-design/icons';
import { Interweave } from 'interweave';
import { Card, Button, Modal } from 'antd';
import CustomBarChart from './graphs/CustomBarchart';
import CustomLineChart from './graphs/CustomLineChart';
import CustomRadarChart from './graphs/CustomRadarChart';
import CustomPieChart from './graphs/CustomPieChart';
const { Meta } = Card;
const DraggableCard = ({ title, onExpand, chartData, chartConfig, chartType, onDragCard, dragButtonColor, isOpen, handleOk, handleCancel, showVisuals }) => {
  return (
    <Card width="100%" height={385}
      title={title}
      extra={
        <>
          <Button type="primary" onClick={onExpand} icon={<ExpandOutlined />} margin={{ top: 0, right: 30, left: 50, bottom: 0 }} />
          <Button type={dragButtonColor} onClick={onDragCard} icon={<DragOutlined />} />
        </>}
    >

      {!chartType && (
        <Meta style={{ textAlign: 'center' }} description="Please provide a data file and config files..." />
      )}
      { chartType == 'bar' && (
        <> <CustomBarChart raw={chartData} config={chartConfig} />
          <Modal title={title} open={isOpen} onOk={handleOk} onCancel={handleCancel} width={1200}>
            <CustomBarChart raw={chartData} config={chartConfig} />
          </Modal></>)}
          { chartType == 'radar' && (
        <> <CustomRadarChart raw={chartData} config={chartConfig} />
          <Modal title={title} open={isOpen} onOk={handleOk} onCancel={handleCancel} width={1200}>
            <CustomRadarChart raw={chartData} config={chartConfig} />
          </Modal></>)}
          { chartType == 'line' && (
        <> <CustomLineChart raw={chartData} config={chartConfig} />
          <Modal title={title} open={isOpen} onOk={handleOk} onCancel={handleCancel} width={1200}>
            <CustomLineChart raw={chartData} config={chartConfig} />
          </Modal></>)}

    </Card>
  );
};

export default DraggableCard;
