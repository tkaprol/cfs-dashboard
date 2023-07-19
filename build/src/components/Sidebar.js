import React, { useEffect, useState } from 'react';
import {
  UserOutlined,
  BookOutlined,
  HomeOutlined,
  GlobalOutlined,
  HistoryOutlined,
  LogoutOutlined,
  CodeOutlined,
  DashboardOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Menu, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import logo from './../logo.svg';
import { useKeycloak } from '@react-keycloak/web';
import NotificationBox from './NotificationBox'; // Import the new component

function getItem(label, key, icon, path, children = undefined, type, style = {}) {
  return {
    key,
    icon,
    path,
    children: Array.isArray(children) ? children : undefined,
    label: path ? <Link to={path}>{label}</Link> : label,
    type,
    style,
  };
}

const SideBar = ({ menu }) => {
  const { keycloak } = useKeycloak();

  const navigate = useNavigate();

  const OnMenuItemClick = (e) => {
    if (e.key === 'account') {
      window.open(keycloak.createAccountUrl(), '_self');
    } else if (e.key === 'logout') {
      window.open(keycloak.createLogoutUrl(), '_self');
    } else {
      const selectedItem = items.find((item) => item.key === e.key);
      if (selectedItem?.path) navigate(selectedItem.path);
    }
  };

  const items = [
    { type: 'divider' },
    getItem('Home', '1', <DashboardOutlined />, '/home'),
    { type: 'divider' },
    getItem('Console', '20', <CodeOutlined />, '/console'),
    { type: 'divider' },
    getItem('History', '3', <HistoryOutlined />, '/history'),
    getItem('Account', 'account', <UserOutlined />),
    getItem('User Guide', '19', <BookOutlined />, '/user-guides'),
    { type: 'divider' },
    getItem('Sign Out', 'logout', <LogoutOutlined />),
    { type: 'divider' },
  ];

  return (
    <div>
      <div
        style={{
          height: 160,
          padding: 20,
          borderBottomRightRadius: 10,
        }}
      >
        <Row justify='space-around' align='middle'>
          <Col span={20}>
            <img src={logo} alt='logo' style={{ mixBlendMode: 'plus-lighter' }} />
          </Col>
        </Row>
      </div>
      <Menu defaultSelectedKeys={[menu]} mode='inline' theme='dark' items={items} onClick={OnMenuItemClick} />
      <NotificationBox />
    </div>
  );
};

export default SideBar;
