import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import { FileTextOutlined, CalendarOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuth } from '../../../modules/users/contexts/AuthContext';

const { Header, Sider, Content } = Layout;

export function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            signOut();
            navigate('/login');
        } else {
            navigate(key);
        }
    };

    const selectedKey = location.pathname;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                    {!collapsed ? (
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1890ff' }}>
                            Fila de Espera
                        </h1>
                    ) : (
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1890ff' }}>FE</h1>
                    )}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    items={[
                        {
                            key: '/dashboard/solicitacoes',
                            icon: <FileTextOutlined />,
                            label: 'Consultas/Exames',
                        },
                        {
                            key: '/dashboard/pre-agendamento',
                            icon: <CalendarOutlined />,
                            label: 'Pré-agendamento',
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 24px 0 0',
                    background: colorBgContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
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

                    <Button
                        type="text"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={() => handleMenuClick({ key: 'logout' })}
                        style={{
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Sair
                    </Button>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        overflowY: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
