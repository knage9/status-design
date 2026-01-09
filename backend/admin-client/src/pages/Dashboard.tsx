import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Badge, Button, Progress, Typography, Skeleton, App, Flex, Grid } from 'antd';
import {
    MessageOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    FormOutlined,
    CheckOutlined,
    CloseOutlined,
    StarFilled,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { useBreakpoint } = Grid;

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

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { notification, modal } = App.useApp();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px

    const fetchData = async () => {
        try {
            setLoading(true);
            // USER REQUEST: Use full URL to avoid 404
            const response = await axios.get('/api/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            notification.error({
                title: 'Ошибка загрузки данных',
                description: 'Не удалось получить данные дашборда.'
            });
            // Fallback data
            setData({
                stats: {
                    reviews: { total: 0, pending: 0, avgRating: 0, thisWeek: 0 },
                    posts: { total: 0, draft: 0, thisWeek: 0 },
                    portfolio: { total: 0, draft: 0, thisWeek: 0 },
                    requests: { total: 0, new: 0, thisWeek: 0 }
                },
                pendingReviews: [],
                topServices: [],
                activityChart: []
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const safeData = data || {
        stats: {
            reviews: { total: 0, pending: 0, avgRating: 0, thisWeek: 0 },
            posts: { total: 0, draft: 0, thisWeek: 0 },
            portfolio: { total: 0, draft: 0, thisWeek: 0 },
            requests: { total: 0, new: 0, thisWeek: 0 }
        },
        pendingReviews: [],
        topServices: [],
        activityChart: []
    };

    const { stats, pendingReviews, topServices, activityChart } = safeData;
    const maxServiceCount = Math.max(...(topServices?.map(s => s.count) || [1]), 1);

    const StatCard = ({ title, value, icon, color, trend, badge, onClick, loading }: any) => (
        <Card
            hoverable
            className="stat-card"
            onClick={!loading ? onClick : undefined}
            style={{ height: '100%', cursor: onClick && !loading ? 'pointer' : 'default' }}
        >
            <Skeleton loading={loading} active avatar paragraph={{ rows: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                        backgroundColor: `${color}20`,
                        padding: 12,
                        borderRadius: '50%',
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
                    styles={{ content: { fontWeight: 'bold', fontSize: 28, marginTop: 16 } }}
                />
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, color: trend > 0 ? '#52c41a' : '#8c8c8c' }}>
                    {trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    <span style={{ marginLeft: 4 }}>{trend} за неделю</span>
                </div>
            </Skeleton>
        </Card>
    );

    return (
        <div style={{ padding: isMobile ? 0 : 24 }}>
            {/* ВЕРХНИЙ РЯД */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Отзывы"
                        value={stats.reviews.total}
                        icon={<MessageOutlined />}
                        color="#1458E4"
                        trend={stats.reviews.thisWeek}
                        badge={stats.reviews.pending}
                        onClick={() => navigate('/reviews')}
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Новости"
                        value={stats.posts.total}
                        icon={<FileTextOutlined />}
                        color="#52c41a"
                        trend={stats.posts.thisWeek}
                        badge={stats.posts.draft}
                        onClick={() => navigate('/posts')}
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Портфолио"
                        value={stats.portfolio.total}
                        icon={<AppstoreOutlined />}
                        color="#faad14"
                        trend={stats.portfolio.thisWeek}
                        badge={stats.portfolio.draft}
                        onClick={() => navigate('/portfolio')}
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Заявки"
                        value={stats.requests?.total || 0}
                        icon={<FormOutlined />}
                        color="#ff4d4f"
                        trend={stats.requests?.thisWeek || 0}
                        badge={stats.requests?.new || 0}
                        onClick={() => navigate('/requests')}
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* ВТОРОЙ РЯД */}
            <Row gutter={[16, 16]} style={{ marginTop: isMobile ? 16 : 24 }}>
                <Col span={24}>
                    <Card title="Активность за последние 7 дней" loading={loading}>
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                            <LineChart data={activityChart}>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: isMobile ? 11 : 12 }}
                                />
                                <YAxis
                                    tick={{ fontSize: isMobile ? 11 : 12 }}
                                />
                                <Tooltip />
                                <Legend
                                    wrapperStyle={{ fontSize: isMobile ? 12 : 14 }}
                                />
                                <Line type="monotone" dataKey="reviews" stroke="#1458E4" name="Отзывы" strokeWidth={2} />
                                <Line type="monotone" dataKey="posts" stroke="#52c41a" name="Новости" strokeWidth={2} />
                                <Line type="monotone" dataKey="portfolio" stroke="#faad14" name="Портфолио" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* ТРЕТИЙ РЯД */}
            <Row gutter={[16, 16]} style={{ marginTop: isMobile ? 16 : 24 }}>
                <Col xs={24} lg={14}>
                    <Card
                        title={<>Требует модерации <Badge count={pendingReviews?.length || 0} style={{ backgroundColor: '#faad14', marginLeft: 8 }} /></>}
                        style={{ height: '100%' }}
                        loading={loading}
                    >
                        <Flex vertical gap="middle">
                            {pendingReviews.map((review) => (
                                <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
                                    <Flex
                                        justify="space-between"
                                        align="start"
                                        vertical={isMobile}
                                        gap={isMobile ? 12 : 0}
                                    >
                                        <Flex gap="small" style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                                                <StarFilled style={{ color: '#faad14', fontSize: 20 }} />
                                                <span style={{ marginTop: 4 }}>{review.rating}</span>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Text strong>{`${review.carBrand} ${review.carModel}`}</Text>
                                                <div>
                                                    <Text
                                                        ellipsis
                                                        style={{
                                                            display: 'block',
                                                            maxWidth: isMobile ? '100%' : 300
                                                        }}
                                                    >
                                                        {review.text}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Flex>
                                        <Flex
                                            gap="small"
                                            vertical={isMobile}
                                            style={{ width: isMobile ? '100%' : 'auto' }}
                                        >
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={() => handleApproveReview(review.id)}
                                                block={isMobile}
                                                size={isMobile ? 'large' : 'middle'}
                                            >
                                                Одобрить
                                            </Button>
                                            <Button
                                                danger
                                                icon={<CloseOutlined />}
                                                onClick={() => handleRejectReview(review.id)}
                                                block={isMobile}
                                                size={isMobile ? 'large' : 'middle'}
                                            >
                                                Отклонить
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </div>
                            ))}
                            {pendingReviews.length === 0 && <Text type="secondary">Нет отзывов на модерации</Text>}
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title="Популярные услуги" style={{ height: '100%' }} loading={loading}>
                        {topServices?.map((item, index) => (
                            <div key={index} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text>{getServiceName(item.service)}</Text>
                                    <Text type="secondary">{item.count}</Text>
                                </div>
                                <Progress
                                    percent={(item.count / maxServiceCount) * 100}
                                    showInfo={false}
                                    strokeColor="#1458E4"
                                />
                            </div>
                        ))}

                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                            <Statistic
                                title="Средний рейтинг"
                                value={stats.reviews.avgRating}
                                precision={1}
                                suffix="/ 5.0"
                                prefix={<StarFilled style={{ color: '#faad14' }} />}
                                styles={{ content: { fontSize: 32 } }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <style>{`
        .stat-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
