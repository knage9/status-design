import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, theme, Drawer, Button, App as AntApp, Dropdown, Switch } from 'antd';
import { FileTextOutlined, ReadOutlined, PictureOutlined, MenuOutlined, DashboardOutlined, FileDoneOutlined, LogoutOutlined, UserOutlined, TeamOutlined, BulbOutlined, DollarOutlined } from '@ant-design/icons';
import ReviewsPage from './pages/ReviewsPage';
import PostsPage from './pages/PostsPage';
import PortfolioPage from './pages/PortfolioPage';
import Dashboard from './pages/Dashboard';
import RequestsPage from './pages/RequestsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import WorkOrderCreatePage from './pages/WorkOrderCreatePage';
import WorkOrderEditPage from './pages/WorkOrderEditPage';
import UsersPage from './pages/UsersPage';
import ExecutorStatsPage from './pages/ExecutorStatsPage';
import LoadChartPage from './pages/LoadChartPage';
import LoginPage from './auth/LoginPage';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import './App.css';

const { Header, Sider, Content } = Layout;

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const location = useLocation();
  const { user, logout } = useAuth();
  const selectedKey = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Don't show layout on login page
  if (location.pathname === '/login') {
    return null;
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Дашборд</Link>,
    },
    {
      key: 'reviews',
      icon: <FileTextOutlined />,
      label: <Link to="/reviews">Отзывы</Link>,
    },
    {
      key: 'posts',
      icon: <ReadOutlined />,
      label: <Link to="/posts">Новости/Статьи</Link>,
    },
    {
      key: 'portfolio',
      icon: <PictureOutlined />,
      label: <Link to="/portfolio">Портфолио</Link>,
    },
    {
      key: 'requests',
      icon: <FileDoneOutlined />,
      label: <Link to="/requests">Заявки</Link>,
    },
    {
      key: 'work-orders',
      icon: <FileTextOutlined />,
      label: <Link to="/work-orders">Заказ-наряды</Link>,
    },
    {
      key: 'load-chart',
      icon: <DashboardOutlined />,
      label: <Link to="/load-chart">График загрузки</Link>,
    },
    {
      key: 'executor-stats',
      icon: <DollarOutlined />,
      label: <Link to="/executor-stats">Статистика выплат</Link>,
    },
  ];

  // Add Users menu item for admins only
  if (user?.role === 'ADMIN') {
    menuItems.push({
      key: 'users',
      icon: <TeamOutlined />,
      label: <Link to="/users">Пользователи</Link>,
    });
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `${user?.name} (${user?.role})`,
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выход',
      onClick: logout,
      danger: true,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            if (!broken) setMobileOpen(false);
          }}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            left: 0,
            top: 0,
          }}
          className="desktop-sidebar"
        >
          <div style={{ padding: '24px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#fff', margin: 0 }}>Status Design</h2>
            <p style={{ color: '#aaa', fontSize: 12, margin: '4px 0 0 0' }}>Админ-панель</p>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>

        {/* Mobile Drawer */}
        <Drawer
          placement="left"
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          className="mobile-drawer"
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ margin: 0 }}>Status Design</h2>
            <p style={{ color: '#888', fontSize: 12, margin: '4px 0 0 0' }}>Админ-панель</p>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={() => setMobileOpen(false)}
          />
        </Drawer>

        <Layout>
          <Header style={{
            background: isDarkMode ? '#141414' : '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0'
          }}>
            <Button
              className="mobile-menu-button"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
              style={{ fontSize: '18px', width: 48, height: 48 }}
            />
            <div style={{ flex: 1 }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BulbOutlined style={{ fontSize: 16 }} />
                <Switch
                  checked={isDarkMode}
                  onChange={setIsDarkMode}
                  checkedChildren="🌙"
                  unCheckedChildren="☀️"
                />
              </div>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text" icon={<UserOutlined />} style={{ height: 48 }}>
                  {user?.name}
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)' }}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
                <Route path="/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
                <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
                <Route path="/work-orders" element={<ProtectedRoute><WorkOrdersPage /></ProtectedRoute>} />
                <Route path="/work-orders/new" element={<ProtectedRoute><WorkOrderCreatePage /></ProtectedRoute>} />
                <Route path="/work-orders/:id" element={<ProtectedRoute><WorkOrderDetailPage /></ProtectedRoute>} />
                <Route path="/work-orders/:id/edit" element={<ProtectedRoute><WorkOrderEditPage /></ProtectedRoute>} />
                <Route path="/executor-stats" element={<ProtectedRoute><ExecutorStatsPage /></ProtectedRoute>} />
                <Route path="/load-chart" element={<ProtectedRoute><LoadChartPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute requiredRole="ADMIN"><UsersPage /></ProtectedRoute>} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

function App() {
  return (
    <AntApp>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </AntApp>
  );
}

export default App;
