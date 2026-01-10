import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Badge, Button, Typography, Skeleton, App, Flex, Grid, List, Progress, Table, Tag, Space, theme, Collapse } from 'antd';
import {
    MessageOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    FormOutlined,
    CheckOutlined,
    CloseOutlined,
    StarFilled,
    ArrowUpOutlined,
    ArrowDownOutlined,
    UserOutlined,
    ClockCircleOutlined,
    CarOutlined,
    NumberOutlined,
    RocketOutlined,
    HistoryOutlined,
    DashboardOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip as ChartTooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

interface DashboardStats {
    reviews: { total: number; pending: number; avgRating: number; thisWeek: number };
    posts: { total: number; draft: number; thisWeek: number };
    portfolio: { total: number; draft: number; thisWeek: number };
    requests: { total: number; new: number; thisWeek: number };
}

interface Review {
    id: number;
    rating: number;
    carBrand: string;
    carModel: string;
    text: string;
    status: string;
}

interface DashboardData {
    stats: DashboardStats;
    pendingReviews: Review[];
    topServices: { service: string; count: number }[];
    activityChart: { date: string; reviews: number; posts: number; portfolio: number }[];
}

const workOrderStatusMap: Record<string, string> = {
    NEW: 'Новый',
    ASSIGNED_TO_MASTER: 'У мастера',
    ASSIGNED_TO_EXECUTOR: 'У исполнителей',
    IN_PROGRESS: 'В работе',
    PAINTING: 'Покраска',
    POLISHING: 'Полировка',
    ASSEMBLY_STAGE: 'Сборка',
    UNDER_REVIEW: 'На проверке',
    APPROVED: 'Одобрен',
    RETURNED_FOR_REVISION: 'Возврат на доработку',
    SENT: 'Отправлен',
    SHIPPED: 'Отгружен',
    ASSEMBLED: 'Собран',
    ISSUED: 'Выдан',
    READY: 'Готов',
    COMPLETED: 'Завершен',
};

const requestStatusMap: Record<string, string> = {
    NOVA: 'Новая',
    SDELKA: 'Сделка',
    OTKLONENO: 'Отклонено',
    ZAVERSHENA: 'Завершена',
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        NOVA: 'orange',
        SDELKA: 'cyan',
        OTKLONENO: 'red',
        ZAVERSHENA: 'green',
        NEW: 'blue',
        ASSIGNED_TO_MASTER: 'purple',
        ASSIGNED_TO_EXECUTOR: 'geekblue',
        IN_PROGRESS: 'processing',
        COMPLETED: 'success',
        ISSUED: 'success',
        SENT: 'success',
        ASSEMBLED: 'success',
    };
    return colors[status] || 'default';
};

const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}ч ${m}м` : `${m}м`;
};

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [roleData, setRoleData] = useState<any>(null);
    const navigate = useNavigate();
    const { notification, modal } = App.useApp();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;
    const metricColProps = { xs: 24, sm: 12, md: 12, lg: 8, xl: 6 };
    const { token } = useToken();
    const isDarkMode = token.colorBgBase === '#141414' || document.documentElement.getAttribute('data-theme') === 'dark';
    const { user, activeProfileId, profileChangeToken, isAuthenticated, isLoading: authLoading, isSwitchingProfile } = useAuth();
    const touchButtonProps = { className: 'touch-btn' };

    const SectionCard = ({ title, extra, children, secondary = false }: any) => {
        if (isMobile && secondary) {
            return (
                <Collapse
                    bordered={false}
                    className="dashboard-collapse"
                    items={[{
                        key: title,
                        label: title,
                        children: <div className="dashboard-collapse-body">{children}</div>,
                        extra,
                    }]}
                />
            );
        }
        return (
            <Card title={title} extra={extra} className="dashboard-section">
                {children}
            </Card>
        );
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            notification.error({
                title: 'Ошибка загрузки данных',
                description: 'Не удалось получить данные дашборда.'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleDashboard = async (role: string) => {
        try {
            setLoading(true);
            const endpoint = `/dashboard/${role.toLowerCase()}`;
            const response = await api.get(endpoint);
            setRoleData(response.data);
        } catch (error) {
            console.error(`Failed to fetch ${role} dashboard data:`, error);
            notification.error({ title: `Ошибка загрузки дашборда ${role}` });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !isAuthenticated || !user) return;
        if (user.role === 'ADMIN') {
            fetchData();
        } else {
            fetchRoleDashboard(user.role);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.role, user?.id, activeProfileId, profileChangeToken, authLoading, isAuthenticated]);

    useEffect(() => {
        if (isSwitchingProfile) {
            setLoading(true);
        }
    }, [isSwitchingProfile]);

    const handleApproveReview = (id: number) => {
        modal.confirm({
            title: 'Одобрить отзыв?',
            content: 'Отзыв будет опубликован на сайте.',
            onOk: async () => {
                try {
                    await api.put(`/reviews/admin/${id}`, { status: 'PUBLISHED' });
                    notification.success({ title: 'Отзыв одобрен' });
                    fetchData();
                } catch (error) {
                    notification.error({ title: 'Ошибка при одобрении' });
                }
            },
        });
    };

    const handleRejectReview = (id: number) => {
        modal.confirm({
            title: 'Отклонить отзыв?',
            content: 'Отзыв будет помечен как отклоненный.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await api.put(`/reviews/admin/${id}`, { status: 'REJECTED' });
                    notification.success({ title: 'Отзыв отклонен' });
                    fetchData();
                } catch (error) {
                    notification.error({ title: 'Ошибка при отклонении' });
                }
            },
        });
    };

    const getServiceName = (serviceKey: string) => {
        const serviceMap: Record<string, string> = {
            'antichrome': 'Антихром',
            'soundproofing': 'Шумоизоляция',
            'ceramic': 'Керамика',
            'polish': 'Полировка',
            'carbon': 'Карбон',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Колесные диски',
            'cleaning': 'Химчистка',
            'other': 'Другое'
        };
        return serviceMap[serviceKey] || serviceKey;
    };

    const StatCard = ({ title, value, icon, color, trend, badge, onClick, loading, suffix }: any) => (
        <Card
            hoverable
            className="stat-card dashboard-touch-card"
            onClick={!loading ? onClick : undefined}
            style={{ height: '100%', minHeight: isMobile ? 130 : 150, cursor: onClick && !loading ? 'pointer' : 'default' }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
        >
            <Skeleton loading={loading} active avatar paragraph={{ rows: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                        backgroundColor: `${color}20`,
                        padding: 12,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {React.cloneElement(icon, { style: { fontSize: 24, color: color } })}
                    </div>
                    {badge > 0 && <Badge count={badge} style={{ backgroundColor: '#faad14' }} />}
                </div>
                <Statistic
                    title={title}
                    value={value}
                    suffix={suffix}
                    styles={{ content: { fontWeight: 'bold', fontSize: 28, marginTop: 16 } }}
                />
                {trend !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, color: trend >= 0 ? '#52c41a' : '#8c8c8c' }}>
                        {trend > 0 ? <ArrowUpOutlined /> : (trend < 0 ? <ArrowDownOutlined /> : null)}
                        <span style={{ marginLeft: 4 }}>{trend} за неделю</span>
                    </div>
                )}
            </Skeleton>
        </Card>
    );

    const renderAdmin = () => {
        if (!data) return <Skeleton active />;
        const { stats, pendingReviews, topServices, activityChart } = data;
        const maxServiceCount = Math.max(...(topServices?.map(s => s.count) || [1]), 1);

        return (
            <div style={{ padding: isMobile ? 0 : 24 }}>
                <Row gutter={[12, 12]} className="dashboard-metrics">
                    <Col {...metricColProps}><StatCard title="Отзывы" value={stats.reviews.total} icon={<MessageOutlined />} color="#1458E4" trend={stats.reviews.thisWeek} badge={stats.reviews.pending} onClick={() => navigate('/reviews')} loading={loading} /></Col>
                    <Col {...metricColProps}><StatCard title="Новости" value={stats.posts.total} icon={<FileTextOutlined />} color="#52c41a" trend={stats.posts.thisWeek} badge={stats.posts.draft} onClick={() => navigate('/posts')} loading={loading} /></Col>
                    <Col {...metricColProps}><StatCard title="Портфолио" value={stats.portfolio.total} icon={<AppstoreOutlined />} color="#faad14" trend={stats.portfolio.thisWeek} badge={stats.portfolio.draft} onClick={() => navigate('/portfolio')} loading={loading} /></Col>
                    <Col {...metricColProps}><StatCard title="Заявки" value={stats.requests?.total || 0} icon={<FormOutlined />} color="#ff4d4f" trend={stats.requests?.thisWeek || 0} badge={stats.requests?.new || 0} onClick={() => navigate('/requests')} loading={loading} /></Col>
                </Row>
                <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                    <Col span={24}>
                        <SectionCard title="Активность за последние 7 дней" secondary>
                            <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                                <LineChart data={activityChart}>
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip />
                                    <Legend wrapperStyle={{ fontSize: 14 }} />
                                    <Line type="monotone" dataKey="reviews" stroke="#1458E4" name="Отзывы" strokeWidth={2} />
                                    <Line type="monotone" dataKey="posts" stroke="#52c41a" name="Новости" strokeWidth={2} />
                                    <Line type="monotone" dataKey="portfolio" stroke="#faad14" name="Портфолио" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </SectionCard>
                    </Col>
                </Row>
                <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                    <Col xs={24} lg={14}>
                        <SectionCard title={<>Требует модерации <Badge count={pendingReviews?.length || 0} style={{ backgroundColor: '#faad14', marginLeft: 8 }} /></>} secondary>
                            <Flex vertical gap="middle">
                                {pendingReviews.map((review) => (
                                    <div key={review.id} className="dashboard-item">
                                        <Flex justify="space-between" align="start" vertical={isMobile} gap={isMobile ? 12 : 0}>
                                            <Flex gap="small" style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                                                    <StarFilled style={{ color: '#faad14', fontSize: 20 }} />
                                                    <span style={{ marginTop: 4 }}>{review.rating}</span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Text strong>{`${review.carBrand} ${review.carModel}`}</Text>
                                                    <div>
                                                        <Text ellipsis style={{ display: 'block', maxWidth: 300 }}>{review.text}</Text>
                                                    </div>
                                                </div>
                                            </Flex>
                                            <Flex gap="small" wrap>
                                                <Button type="primary" icon={<CheckOutlined />} {...touchButtonProps} onClick={() => handleApproveReview(review.id)}>Одобрить</Button>
                                                <Button danger icon={<CloseOutlined />} {...touchButtonProps} onClick={() => handleRejectReview(review.id)}>Отклонить</Button>
                                            </Flex>
                                        </Flex>
                                    </div>
                                ))}
                                {pendingReviews.length === 0 && <Text type="secondary">Нет отзывов на модерации</Text>}
                            </Flex>
                        </SectionCard>
                    </Col>
                    <Col xs={24} lg={10}>
                        <SectionCard title="Популярные услуги" secondary>
                            {topServices?.map((item, index) => (
                                <div key={index} style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text>{getServiceName(item.service)}</Text>
                                        <Text type="secondary">{item.count}</Text>
                                    </div>
                                    <Progress percent={(item.count / maxServiceCount) * 100} showInfo={false} strokeColor="#1458E4" />
                                </div>
                            ))}
                            <div style={{ marginTop: 32, textAlign: 'center' }}>
                                <Statistic title="Средний рейтинг" value={stats.reviews.avgRating} precision={1} suffix="/ 5.0" prefix={<StarFilled style={{ color: '#faad14' }} />} />
                            </div>
                        </SectionCard>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderManager = () => {
        if (!roleData) return <Skeleton active />;
        const { stats, statusStats, myRequests, activeWorkOrders } = roleData;

        return (
            <div style={{ padding: isMobile ? 0 : 24 }}>
                <Flex gap={8} wrap style={{ marginBottom: 12 }}>
                    <Button type="primary" {...touchButtonProps} onClick={() => navigate('/requests')}>Заявки</Button>
                    <Button {...touchButtonProps} onClick={() => navigate('/work-orders')}>Заказ-наряды</Button>
                    <Button {...touchButtonProps} onClick={() => navigate('/load-chart')}>Доска этапов</Button>
                </Flex>
                <Row gutter={[12, 12]} className="dashboard-metrics">
                    <Col {...metricColProps}><StatCard title="Новые заявки" value={stats.newRequestsToday} suffix="сегодня" icon={<RocketOutlined />} color="#1458E4" onClick={() => navigate('/requests')} /></Col>
                    <Col {...metricColProps}><StatCard title="Сделки" value={stats.dealsToday} suffix="сегодня" icon={<CheckOutlined />} color="#52c41a" onClick={() => navigate('/requests')} /></Col>
                    <Col {...metricColProps}><StatCard title="Активные ЗН" value={stats.activeWOCount} icon={<DashboardOutlined />} color="#faad14" onClick={() => navigate('/work-orders')} /></Col>
                    <Col {...metricColProps}><StatCard title="Завершено ЗН" value={stats.completedWOWeek} suffix="за 7 дн" icon={<HistoryOutlined />} color="#ff4d4f" onClick={() => navigate('/work-orders')} /></Col>
                </Row>

                <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                    <Col xs={24} lg={8}>
                        <SectionCard title="Заявки по статусам (7 дней)" secondary>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={statusStats} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="status" type="category" tickFormatter={(val) => requestStatusMap[val] || val} width={80} />
                                    <ChartTooltip formatter={(val) => [val, 'Количество']} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {statusStats.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={getStatusColor(entry.status) === 'orange' ? '#faad14' : getStatusColor(entry.status) === 'cyan' ? '#13c2c2' : getStatusColor(entry.status) === 'red' ? '#ff4d4f' : '#52c41a'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                    </Col>
                    <Col xs={24} lg={16}>
                        <SectionCard title="Активные заявки (Новая / Сделка)" extra={<Button type="link" {...touchButtonProps} onClick={() => navigate('/requests')}>Все заявки</Button>} secondary>
                            {isMobile ? (
                                <List
                                    dataSource={myRequests}
                                    renderItem={(r: any) => (
                                        <List.Item
                                            actions={[
                                                r.phone ? <Button key="call" icon={<PhoneOutlined />} {...touchButtonProps} onClick={() => window.open(`tel:${r.phone}`)}>Позвонить</Button> : null,
                                                <Button key="open" type="primary" {...touchButtonProps} onClick={() => navigate(`/requests/${r.id}`)}>Открыть</Button>
                                            ].filter(Boolean)}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>{r.name}</Text>}
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text><ClockCircleOutlined /> {dayjs(r.createdAt).format('DD.MM HH:mm')}</Text>
                                                        <Text><CarOutlined /> {r.carModel}</Text>
                                                        <Tag color={getStatusColor(r.status)}>{requestStatusMap[r.status] || r.status}</Tag>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Table
                                    dataSource={myRequests}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        { title: 'Дата', dataIndex: 'createdAt', render: (d) => dayjs(d).format('DD.MM HH:mm') },
                                        { title: 'Клиент', dataIndex: 'name' },
                                        { title: 'Авто', dataIndex: 'carModel' },
                                        { title: 'Статус', dataIndex: 'status', render: (s) => <Tag color={getStatusColor(s)}>{requestStatusMap[s] || s}</Tag> },
                                        {
                                            title: 'Действие',
                                            render: (_, r) => (
                                                <Space size="small" wrap>
                                                    {r.phone && <Button {...touchButtonProps} icon={<PhoneOutlined />} onClick={() => window.open(`tel:${r.phone}`)}>Позвонить</Button>}
                                                    <Button type="primary" {...touchButtonProps} onClick={() => navigate(`/requests/${r.id}`)}>Открыть</Button>
                                                </Space>
                                            )
                                        }
                                    ]}
                                />
                            )}
                        </SectionCard>
                    </Col>
                </Row>

                <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                    <Col span={24}>
                        <SectionCard title="Активные заказ-наряды" extra={<Button type="link" {...touchButtonProps} onClick={() => navigate('/work-orders')}>Все ЗН</Button>} secondary>
                            {isMobile ? (
                                <List
                                    dataSource={activeWorkOrders}
                                    pagination={{ pageSize: 5 }}
                                    renderItem={(r: any) => (
                                        <List.Item
                                            actions={[
                                                <Button key="open" type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Открыть</Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>#{r.orderNumber}</Text>}
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text><UserOutlined /> {r.customerName}</Text>
                                                        <Text><CarOutlined /> {r.carBrand} {r.carModel}</Text>
                                                        <Tag color={getStatusColor(r.status)}>{workOrderStatusMap[r.status] || r.status}</Tag>
                                                        <Text type="secondary">
                                                            В работе: {(() => {
                                                                const diff = dayjs().diff(dayjs(r.createdAt), 'hour');
                                                                return diff > 24 ? `${Math.floor(diff / 24)} дн` : `${diff} ч`;
                                                            })()}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Table
                                    dataSource={activeWorkOrders}
                                    rowKey="id"
                                    pagination={{ pageSize: 5 }}
                                    size="small"
                                    columns={[
                                        { title: '№ ЗН', dataIndex: 'orderNumber', render: (n) => <Text strong>{n}</Text> },
                                        { title: 'Клиент', dataIndex: 'customerName' },
                                        { title: 'Авто', render: (_, r) => `${r.carBrand} ${r.carModel}` },
                                        { title: 'Статус', dataIndex: 'status', render: (s) => <Tag color={getStatusColor(s)}>{workOrderStatusMap[s] || s}</Tag> },
                                        { title: 'Мастер', dataIndex: ['master', 'name'], render: (m) => m || '—' },
                                        { title: 'В работе', dataIndex: 'createdAt', render: (d) => {
                                            const diff = dayjs().diff(dayjs(d), 'hour');
                                            return diff > 24 ? `${Math.floor(diff / 24)} дн` : `${diff} ч`;
                                        }},
                                        { title: '', render: (_, r) => <Button type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Открыть</Button> }
                                    ]}
                                />
                            )}
                        </SectionCard>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderMaster = () => {
        if (!roleData) return <Skeleton active />;
        const { stats, executorStage, masterStage } = roleData;

        return (
            <div style={{ padding: isMobile ? 0 : 24 }}>
                <Row gutter={[12, 12]} className="dashboard-metrics">
                    <Col {...metricColProps}><StatCard title="Новые" value={stats.newWorkOrders ?? stats.executorStage} icon={<NumberOutlined />} color="#1458E4" onClick={() => navigate('/work-orders')} /></Col>
                    <Col {...metricColProps}><StatCard title="У мастера" value={stats.masterStage} icon={<DashboardOutlined />} color="#faad14" onClick={() => navigate('/work-orders')} /></Col>
                    <Col {...metricColProps}><StatCard title="У исполнителей" value={stats.executorStage} icon={<UserOutlined />} color="#52c41a" onClick={() => navigate('/load-chart')} /></Col>
                    <Col {...metricColProps}><StatCard title="Завершено (7 дн)" value={stats.completedWeek} icon={<HistoryOutlined />} color="#ff4d4f" onClick={() => navigate('/work-orders')} /></Col>
                    <Col {...metricColProps}><StatCard title="Завершено сегодня" value={stats.completedToday} icon={<CheckOutlined />} color="#389e0d" onClick={() => navigate('/work-orders')} /></Col>
                    <Col {...metricColProps}><StatCard title="Отправлен/Выдан" value={stats.sentOrIssued ?? stats.completedWeek} icon={<RocketOutlined />} color="#1458E4" onClick={() => navigate('/work-orders')} /></Col>
                </Row>

                <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                    <Col span={24}>
                        <SectionCard title="ЗН у исполнителей (В работе)" extra={<Button type="link" {...touchButtonProps} onClick={() => navigate('/load-chart')}>Доска этапов</Button>} secondary>
                            {isMobile ? (
                                <List
                                    dataSource={executorStage}
                                    renderItem={(r: any) => (
                                        <List.Item
                                            actions={[
                                                <Button key="assign" type="default" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Назначить</Button>,
                                                <Button key="open" type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Открыть</Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>#{r.orderNumber}</Text>}
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text><UserOutlined /> {r.customerName}</Text>
                                                        <Text><CarOutlined /> {r.carBrand} {r.carModel}</Text>
                                                        <Text type="secondary">Исполнители: {r.executors?.length ? r.executors.join(', ') : '—'}</Text>
                                                        <Progress percent={Math.round((r.doneTasks / (r.totalTasks || 1)) * 100)} size="small" format={() => `${r.doneTasks}/${r.totalTasks}`} />
                                                        <Text type="secondary">Время в работе: {formatSeconds(r.timeSeconds)}</Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Table
                                    dataSource={executorStage}
                                    rowKey="id"
                                    size="small"
                                    columns={[
                                        { title: '№ ЗН', dataIndex: 'orderNumber', render: (n) => <Text strong>{n}</Text> },
                                        { title: 'Клиент', dataIndex: 'customerName' },
                                        { title: 'Авто', render: (_, r) => `${r.carBrand} ${r.carModel}` },
                                        { title: 'Исполнители', dataIndex: 'executors', render: (exs: string[]) => exs.length > 0 ? exs.join(', ') : '—' },
                                        { title: 'Прогресс задач', render: (_, r) => <Progress percent={Math.round((r.doneTasks / (r.totalTasks || 1)) * 100)} size="small" format={() => `${r.doneTasks}/${r.totalTasks}`} /> },
                                        { title: 'Время в работе', dataIndex: 'timeSeconds', render: (s) => formatSeconds(s) },
                                        { title: '', render: (_, r) => (
                                            <Space wrap>
                                                <Button {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Назначить</Button>
                                                <Button type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Открыть</Button>
                                            </Space>
                                        ) }
                                    ]}
                                />
                            )}
                        </SectionCard>
                    </Col>
                </Row>

                <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                    <Col span={24}>
                        <SectionCard title="ЗН у мастера (Готовы к финалу)" extra={<Button type="link" {...touchButtonProps} onClick={() => navigate('/work-orders')}>Все ЗН</Button>} secondary>
                            {isMobile ? (
                                <List
                                    dataSource={masterStage}
                                    renderItem={(r: any) => (
                                        <List.Item
                                            actions={[
                                                <Button key="finish" type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Открыть</Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>#{r.orderNumber}</Text>}
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text><UserOutlined /> {r.customerName}</Text>
                                                        <Text><CarOutlined /> {r.carBrand} {r.carModel}</Text>
                                                        <Text type="secondary">Исполнителей было: {r.executorsCount}</Text>
                                                        <Text type="secondary">Общее время: {formatSeconds(r.timeSeconds)}</Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Table
                                    dataSource={masterStage}
                                    rowKey="id"
                                    size="small"
                                    columns={[
                                        { title: '№ ЗН', dataIndex: 'orderNumber', render: (n) => <Text strong>{n}</Text> },
                                        { title: 'Клиент', dataIndex: 'customerName' },
                                        { title: 'Авто', render: (_, r) => `${r.carBrand} ${r.carModel}` },
                                        { title: 'Исполнителей было', dataIndex: 'executorsCount' },
                                        { title: 'Общее время раб.', dataIndex: 'timeSeconds', render: (s) => formatSeconds(s) },
                                        { title: '', render: (_, r) => <Button type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.id}`)}>Открыть и завершить</Button> }
                                    ]}
                                />
                            )}
                        </SectionCard>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderExecutor = () => {
        if (!roleData) return <Skeleton active />;
        const { activeWorkOrders, tasksDone, timeTodaySeconds, history } = roleData;

        return (
            <div style={{ padding: isMobile ? 0 : 24 }}>
                <Row gutter={[12, 12]} className="dashboard-metrics">
                    <Col {...metricColProps}><StatCard title="Мои ЗН в работе" value={activeWorkOrders.length} icon={<RocketOutlined />} color="#1458E4" onClick={() => navigate('/work-orders')} /></Col>
                    <Col {...metricColProps}><StatCard title="Задач сегодня" value={tasksDone.today} suffix={` из ${tasksDone.week} за неделю`} icon={<CheckOutlined />} color="#52c41a" /></Col>
                    <Col {...metricColProps}><StatCard title="Время сегодня" value={formatSeconds(timeTodaySeconds)} icon={<ClockCircleOutlined />} color="#faad14" /></Col>
                </Row>

                <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                    <Col xs={24} lg={14}>
                        <SectionCard title="Мои активные ЗН" extra={<Button type="link" {...touchButtonProps} onClick={() => navigate('/work-orders')}>Все ЗН</Button>} secondary>
                            {isMobile ? (
                                <List
                                    dataSource={activeWorkOrders}
                                    renderItem={(r: any) => (
                                        <List.Item
                                            actions={[
                                                <Button key="take" type="default" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.workOrderId}`)}>Взять в работу</Button>,
                                                <Button key="open" type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.workOrderId}`)}>Открыть</Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>#{r.orderNumber}</Text>}
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text>{r.car}</Text>
                                                        <Tag color={getStatusColor(r.status)}>{workOrderStatusMap[r.status] || r.status}</Tag>
                                                        <Progress percent={Math.round((r.done / r.total) * 100)} size="small" format={() => `${r.done}/${r.total}`} />
                                                        <Text type="secondary">Моё время: {formatSeconds(r.myTimeSeconds)}</Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Table
                                    dataSource={activeWorkOrders}
                                    rowKey="workOrderId"
                                    size="small"
                                    columns={[
                                        { title: '№ ЗН', dataIndex: 'orderNumber', render: (n) => <Text strong>{n}</Text> },
                                        { title: 'Авто', dataIndex: 'car' },
                                        { title: 'Статус ЗН', dataIndex: 'status', render: (s) => <Tag color={getStatusColor(s)}>{workOrderStatusMap[s] || s}</Tag> },
                                        { title: 'Мои задачи', render: (_, r) => <Progress percent={Math.round((r.done / r.total) * 100)} size="small" format={() => `${r.done}/${r.total}`} /> },
                                        { title: 'Моё время', dataIndex: 'myTimeSeconds', render: (s) => formatSeconds(s) },
                                        { title: '', render: (_, r) => (
                                            <Space wrap>
                                                <Button {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.workOrderId}`)}>Взять в работу</Button>
                                                <Button type="primary" {...touchButtonProps} onClick={() => navigate(`/work-orders/${r.workOrderId}`)}>Открыть</Button>
                                            </Space>
                                        ) }
                                    ]}
                                />
                            )}
                        </SectionCard>
                    </Col>
                    <Col xs={24} lg={10}>
                        <SectionCard title="История завершённых" secondary>
                            {isMobile ? (
                                <List
                                    dataSource={history}
                                    pagination={{ pageSize: 5 }}
                                    renderItem={(r: any) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<Text strong>#{r.orderNumber}</Text>}
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text type="secondary">{dayjs(r.completedAt).format('DD.MM.YY')}</Text>
                                                        <Text>Время: {formatSeconds(r.timeSeconds)}</Text>
                                                        <Text strong>{r.earned?.toLocaleString('ru-RU')} ₽</Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Table
                                    dataSource={history}
                                    rowKey="workOrderId"
                                    size="small"
                                    pagination={{ pageSize: 5 }}
                                    columns={[
                                        { title: 'ЗН', dataIndex: 'orderNumber' },
                                        { title: 'Дата', dataIndex: 'completedAt', render: (d) => dayjs(d).format('DD.MM.YY') },
                                        { title: 'Время', dataIndex: 'timeSeconds', render: (s) => formatSeconds(s) },
                                        { title: 'ЗП', dataIndex: 'earned', render: (v) => <Text strong>{v?.toLocaleString('ru-RU')} ₽</Text> }
                                    ]}
                                />
                            )}
                        </SectionCard>
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <div style={{ padding: isMobile ? 0 : 24 }}>
            {loading && !roleData && !data ? (
                <Card>
                    <Skeleton active avatar paragraph={{ rows: 4 }} />
                </Card>
            ) : (
                <>
                    {user?.role === 'ADMIN' && renderAdmin()}
                    {user?.role === 'MANAGER' && renderManager()}
                    {user?.role === 'MASTER' && renderMaster()}
                    {(user?.role === 'EXECUTOR' || user?.role === 'PAINTER') && renderExecutor()}
                    {!user?.role && renderAdmin()}
                </>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .stat-card {
                    border-radius: 12px;
                    box-shadow: 0 2px 8px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'};
                    transition: all 0.3s;
                    border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0'};
                }
                .stat-card:hover {
                    box-shadow: 0 4px 16px ${isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'};
                    transform: translateY(-2px);
                }
                .ant-card-head {
                    border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0'};
                }
                .ant-statistic-title {
                    color: ${isDarkMode ? 'rgba(255,255,255,0.65)' : '#8c8c8c'};
                    font-size: 14px;
                }
            `}} />
        </div>
    );
};

export default Dashboard;
