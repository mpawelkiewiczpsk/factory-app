import React, { useState } from 'react'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  UserOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  UploadOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, Link } from 'react-router-dom'
import { Button, Layout, Menu, theme } from 'antd'
import { logout } from './api/auth.ts'

const { Header, Sider, Content } = Layout

const LayoutApp: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const handleLogout = () => {
    logout().then(() => {
      window.location.href = '/login'
    })
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ position: 'relative' }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: <Link to="/">Strona Główna</Link>,
            },
            {
              key: '2',
              icon: <OrderedListOutlined />,
              label: <Link to="/components">Komponenty</Link>,
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: <Link to="/orders">Zamówienia</Link>,
            },
            {
              key: '4',
              icon: <UserOutlined />,
              label: <Link to="/contractors">Dostawcy</Link>,
            },
            {
              key: '5',
              icon: <UnorderedListOutlined />,
              label: <Link to="/products">Produkty</Link>,
            },
          ]}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Wyloguj
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutApp
