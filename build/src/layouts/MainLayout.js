import React, { useState, useEffect } from 'react';
import { Layout, theme, Breadcrumb, Row, Col } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import SideBar from '../components/Sidebar';
import CustomUserAvatar from '../components/CustomUserAvatar';
import { useKeycloak } from '@react-keycloak/web';
import { getUserInfo } from '../services/userService';

const { Content, Footer, Sider } = Layout;

const breadcrumbNameMap = {
    '/preferences': 'Preferences',
    '/history': 'History',
    '/dashboard': 'Dashboard',
    '/console': 'Console',

    '/analytics': 'Data Analytics Visualization',
    '/maps-visualization': 'Map Visualization'
};

const MainLayout = (props) => {

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const [collapsed, setCollapsed] = useState(false);

    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter((i) => i);
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return {
            key: url,
            title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
        };
    });
    const breadcrumbItems = [
        {
            title: (
                <>
                    <HomeOutlined />
                    <span>Home</span>
                </>
            ),
            key: 'home',
        },
    ].concat(extraBreadcrumbItems);

    const { keycloak } = useKeycloak();
    const [userinfo, setUserinfo] = useState({})

    useEffect(() => {
        //implement logic here to get userinfo

        getUserInfo(keycloak.token).then((response) => {
            setUserinfo(response);
        });

    }, [])


    return (
        <Layout
            style={{ minHeight: '100vh' }}>

            <Sider collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                //style={{background: colorBgContainer}}
                theme='dark'
                width={250}>
                <SideBar menu={props.menu} />
            </Sider>
            <Layout className="site-layout">               
                <Content style={{ margin: '0 16px' }}>
                    <Row justify={'space-between'} style={{ margin: 16 }}>
                        <Col span={19}>
                            <Breadcrumb items={breadcrumbItems} separator=">" />
                        </Col>
                        <Col span={4}>
                            <CustomUserAvatar username={userinfo.preferred_username} />
                        </Col>

                    </Row>

                    <main style={{ margin: 16 }}>{props.children}</main>

                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Copyright © EO4EU {new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>

    );
}

export default MainLayout;
