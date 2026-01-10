import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, theme, Drawer, Button, App as AntApp, Dropdown, Switch, Grid, Modal, Form, Input, Badge } from 'antd';
import { FileTextOutlined, ReadOutlined, PictureOutlined, MenuOutlined, DashboardOutlined, FileDoneOutlined, LogoutOutlined, UserOutlined, TeamOutlined, BulbOutlined, DollarOutlined, PlusOutlined, SwapOutlined, LockOutlined, CloseOutlined } from '@ant-design/icons';
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
const { useBreakpoint } = Grid;

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [addProfileModalOpen, setAddProfileModalOpen] = useState(false);
  const [loginForm] = Form.useForm();

  const location = useLocation();
  const { user, profiles, activeProfileId, activeProfile, logoutProfile, switchProfile, addProfile, isSwitchingProfile } = useAuth();
  const selectedKey = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const screens = useBreakpoint();
  const isMobile = !screens.lg; // < 992px
  const { message } = AntApp.useApp();

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    // Apply theme to root and body for CSS selectors
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    const key = 'profile-switch';
    if (isSwitchingProfile) {
      message.open({ key, type: 'loading', content: 'Переключаю профиль...' });
    } else {
      message.destroy(key);
    }
  }, [isSwitchingProfile, message]);

  // Don't show layout on login page
  if (location.pathname === '/login') {
    return null;
  }

  // Define menu items based on role
  const getMenuItems = () => {
    const role = user?.role;
    const items: any[] = [];

    // Dashboard - доступен всем
    items.push({
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Дашборд</Link>,
    });

    // ADMIN - все разделы
    if (role === 'ADMIN') {
      items.push(
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
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: <Link to="/users">Пользователи</Link>,
        }
      );
    }
    // MANAGER - Дашборд, Заявки, Заказ-наряды, График загрузки, Новости/Статьи (опционально)
    else if (role === 'MANAGER') {
      items.push(
        {
          key: 'posts',
          icon: <ReadOutlined />,
          label: <Link to="/posts">Новости/Статьи</Link>,
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
        }
      );
    }
    // MASTER - Дашборд, Заявки, Заказ-наряды, График загрузки
    else if (role === 'MASTER') {
      items.push(
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
        }
      );
    }
    // EXECUTOR - только Дашборд и Заказ-наряды
    else if (role === 'EXECUTOR') {
      items.push({
        key: 'work-orders',
        icon: <FileTextOutlined />,
        label: <Link to="/work-orders">Заказ-наряды</Link>,
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { text: string; color: string }> = {
      'ADMIN': { text: 'Админ', color: 'red' },
      'MANAGER': { text: 'Менеджер', color: 'blue' },
      'MASTER': { text: 'Мастер', color: 'green' },
      'EXECUTOR': { text: 'Исполнитель', color: 'orange' },
    };
    return roleMap[role] || { text: role, color: 'default' };
  };

  const handleAddProfile = async (values: { email: string; password: string }) => {
    try {
      await addProfile(values.email, values.password);
      message.success('Профиль добавлен');
      setAddProfileModalOpen(false);
      loginForm.resetFields();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Неверный email или пароль');
    }
  };

  const handleSwitchProfile = (profileId: number) => {
    switchProfile(profileId);
    message.success('Профиль переключен');
  };

  const handleLogoutProfile = (profileId: number) => {
    logoutProfile(profileId);
    message.success('Профиль удален');
  };

  const otherProfiles = profiles.filter(p => p.id !== activeProfileId);

  const roleBadge = activeProfile ? getRoleBadge(activeProfile.user.role) : null;

  const userMenuItems = [
    // Active profile header
    {
      key: 'active-profile',
      icon: <UserOutlined />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{activeProfile?.user.name || 'Нет активного профиля'}</span>
          {roleBadge && (
            <Badge 
              status={roleBadge.color as any} 
              text={roleBadge.text}
              style={{ fontSize: 12 }}
            />
          )}
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    // Other profiles - switch options
    ...otherProfiles.map(profile => {
      const profileRole = getRoleBadge(profile.user.role);
      return {
        key: `switch-${profile.id}`,
        icon: <SwapOutlined />,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{profile.user.name}</span>
            <Badge 
              status={profileRole.color as any} 
              text={profileRole.text}
              style={{ fontSize: 11 }}
            />
          </div>
        ),
        onClick: () => handleSwitchProfile(profile.id),
      };
    }),
    // Add profile option
    {
      key: 'add-profile',
      icon: <PlusOutlined />,
      label: 'Добавить профиль',
      onClick: () => setAddProfileModalOpen(true),
    },
    {
      type: 'divider' as const,
    },
    // Logout current profile
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: `Выйти из профиля`,
      onClick: () => activeProfileId && handleLogoutProfile(activeProfileId),
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
          width={240}
          onBreakpoint={(broken) => {
            if (!broken) setMobileOpen(false);
          }}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            left: 0,
            top: 0,
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%)',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)'
          }}
          className="desktop-sidebar modern-sidebar"
        >
          <div style={{ 
            padding: '24px 16px 20px', 
            textAlign: 'center', 
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ 
              color: '#fff', 
              margin: 0, 
              fontSize: 22,
              fontWeight: 600,
              lineHeight: '1.2'
            }}>
              Status Design
            </h2>
            <p style={{ 
              color: '#94a3b8', 
              fontSize: 12, 
              margin: '6px 0 0 0',
              fontWeight: 400,
              letterSpacing: '0.3px'
            }}>
              Админ-панель
            </p>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ 
              borderRight: 0,
              background: 'transparent',
              padding: '16px 8px'
            }}
            className="modern-sidebar-menu"
          />
        </Sider>

        {/* Mobile Drawer */}
        <Drawer
          placement="left"
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          className="mobile-drawer modern-drawer"
          styles={{ 
            body: { padding: 0 },
            mask: { background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }
          }}
          width={320}
          title={null}
          closeIcon={null}
        >
          <div className="drawer-header" style={{ 
            padding: '24px 20px', 
            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            background: isDarkMode ? '#1f1f1f' : '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: 22, 
                  fontWeight: 600,
                  color: isDarkMode ? '#ffffff' : '#1a1a1a',
                  lineHeight: '1.2'
                }}>
                  Status Design
                </h2>
                <p style={{ 
                  color: isDarkMode ? '#888888' : '#666666', 
                  fontSize: 12, 
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}>
                  Админ-панель
                </p>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setMobileOpen(false)}
                className="drawer-close-button"
                style={{ 
                  width: 36, 
                  height: 36,
                  minWidth: 36,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  padding: 0
                }}
              />
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={() => setMobileOpen(false)}
            className="modern-menu"
            style={{
              borderRight: 0,
              background: 'transparent',
              padding: '16px 12px'
            }}
          />
        </Drawer>

        <Layout>
          <Header className="modern-header" style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)' 
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: isMobile ? '0 16px' : '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset' 
              : '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            height: isMobile ? 64 : 72,
            lineHeight: isMobile ? '64px' : '72px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <Button
              className={`mobile-menu-button modern-burger ${mobileOpen ? 'active' : ''}`}
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ 
                fontSize: '20px', 
                width: 44, 
                height: 44,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            <div style={{ flex: 1 }}></div>
            <div className="header-actions" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? 12 : 20 
            }}>
              {!isMobile && (
                <div className="theme-switcher-wrapper" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  padding: '6px 12px',
                  borderRadius: '12px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease'
                }}>
                  <BulbOutlined style={{ fontSize: 18, color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)' }} />
                  <Switch
                    checked={isDarkMode}
                    onChange={setIsDarkMode}
                    checkedChildren="🌙"
                    unCheckedChildren="☀️"
                  />
                </div>
              )}
              {isMobile && (
                <div className="mobile-theme-switcher" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: '10px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease'
                }}>
                  <Switch
                    checked={isDarkMode}
                    onChange={setIsDarkMode}
                    checkedChildren="🌙"
                    unCheckedChildren="☀️"
                    size="small"
                  />
                </div>
              )}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button
                  className="user-menu-button"
                  type="text"
                  icon={<UserOutlined />}
                  style={{ 
                    height: isMobile ? 40 : 44, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? 8 : 10,
                    borderRadius: '12px',
                    padding: isMobile ? '0 10px' : '0 14px',
                    transition: 'all 0.2s ease',
                    background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    fontSize: isMobile ? '14px' : 'inherit'
                  }}
                  loading={isSwitchingProfile}
                >
                  {!isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 500 }}>{activeProfile?.user.name || 'Профиль'}</span>
                      {roleBadge && (
                        <Badge 
                          status={roleBadge.color as any} 
                          text={roleBadge.text}
                          style={{ fontSize: 11, fontWeight: 500 }}
                        />
                      )}
                    </div>
                  )}
                </Button>
              </Dropdown>
            </div>
          </Header>

          {/* Add Profile Modal */}
          <Modal
            title="Добавить профиль"
            open={addProfileModalOpen}
            onCancel={() => {
              setAddProfileModalOpen(false);
              loginForm.resetFields();
            }}
            footer={null}
            width={400}
          >
            <Form
              form={loginForm}
              name="addProfile"
              onFinish={handleAddProfile}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Введите email' },
                  { type: 'email', message: 'Некорректный email' },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Пароль"
                rules={[{ required: true, message: 'Введите пароль' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{ height: 40 }}
                >
                  Добавить профиль
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Content style={{
            margin: isMobile ? '12px 8px 0' : (screens.md ? '16px 12px 0' : '24px 16px 0'),
            overflow: 'initial'
          }}>
            <div style={{
              padding: isMobile ? 12 : (screens.md ? 16 : 24),
              minHeight: `calc(100vh - ${isMobile ? 68 : 88}px)`,
              background: isDarkMode ? 'transparent' : '#f0f2f5'
            }}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReviewsPage /></ProtectedRoute>} />
                <Route path="/posts" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PostsPage /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute allowedRoles={['ADMIN']}><PortfolioPage /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MASTER']}><RequestsPage /></ProtectedRoute>} />
                <Route path="/requests/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MASTER']}><RequestDetailPage /></ProtectedRoute>} />
                <Route path="/work-orders" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MASTER', 'EXECUTOR']}><WorkOrdersPage /></ProtectedRoute>} />
                <Route path="/work-orders/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MASTER']}><WorkOrderCreatePage /></ProtectedRoute>} />
                <Route path="/work-orders/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MASTER', 'EXECUTOR']}><WorkOrderDetailPage /></ProtectedRoute>} />
                <Route path="/work-orders/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MASTER']}><WorkOrderEditPage /></ProtectedRoute>} />
                <Route path="/executor-stats" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ExecutorStatsPage /></ProtectedRoute>} />
                <Route path="/load-chart" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MASTER']}><LoadChartPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
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
      <BrowserRouter basename="/admin">
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

