import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Spin, Empty, Button, Badge, Divider } from 'antd';
import { UserOutlined, ClockCircleOutlined, CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

interface WorkOrderCard {
    id: number;
    orderNumber: string;
    carBrand: string;
    carModel: string;
    customerName: string;
    executorName?: string;
    masterName?: string;
    managerName?: string;
    totalAmount: number;
    createdAt: string;
    status: string;
}

interface LoadChartData {
    stages: Record<string, WorkOrderCard[]>;
}

const statusLabels: Record<string, { label: string, color: string }> = {
    'NEW': { label: 'Новый', color: 'blue' },
    'ASSIGNED_TO_MASTER': { label: 'У мастера', color: 'cyan' },
    'ASSIGNED_TO_EXECUTOR': { label: 'Назначен', color: 'purple' },
    'IN_PROGRESS': { label: 'В работе', color: 'orange' },
    'PAINTING': { label: 'Покраска', color: 'volcano' },
    'POLISHING': { label: 'Полировка', color: 'gold' },
    'ASSEMBLY_STAGE': { label: 'Сборка', color: 'lime' },
    'UNDER_REVIEW': { label: 'На проверке', color: 'magenta' },
    'APPROVED': { label: 'Одобрен', color: 'green' },
    'RETURNED_FOR_REVISION': { label: 'Доработка', color: 'red' },
    'SENT': { label: 'Отправлен', color: 'geekblue' },
    'SHIPPED': { label: 'Доставлен', color: 'blue' },
    'ASSEMBLED': { label: 'Собран', color: 'cyan' },
    'ISSUED': { label: 'Выдан', color: 'gray' },
    'READY': { label: 'Готов', color: 'success' },
    'COMPLETED': { label: 'Завершен', color: 'default' },
};

const LoadChartPage: React.FC = () => {
    const [data, setData] = useState<LoadChartData | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchLoadChart = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/dashboard/load-chart');
            setData(response.data);
        } catch (error) {
            console.error('Failed to load load chart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoadChart();
    }, []);

    const renderColumn = (status: string, cards: WorkOrderCard[]) => {
        const config = statusLabels[status] || { label: status, color: 'default' };

        return (
            <div
                key={status}
                style={{
                    minWidth: 300,
                    maxWidth: 300,
                    background: '#f5f5f5',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    height: 'calc(100vh - 180px)',
                    overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Title level={5} style={{ margin: 0 }}>{config.label}</Title>
                    <Badge count={cards.length} color={config.color} showZero overflowCount={99} />
                </div>

                {cards.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', opacity: 0.5 }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пусто" />
                    </div>
                ) : (
                    cards.map(card => (
                        <Card
                            key={card.id}
                            size="small"
                            hoverable
                            onClick={() => navigate(`/work-orders/${card.id}`)}
                            bodyStyle={{ padding: 12 }}
                            style={{
                                borderLeft: `4px solid ${config.color === 'success' ? '#52c41a' : config.color === 'default' ? '#d9d9d9' : '#1890ff'}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text strong>#{card.orderNumber}</Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    <ClockCircleOutlined /> {new Date(card.createdAt).toLocaleDateString()}
                                </Text>
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <Space align="start">
                                    <CarOutlined style={{ marginTop: 4 }} />
                                    <div>
                                        <Text strong>{card.carBrand} {card.carModel}</Text><br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>{card.customerName}</Text>
                                    </div>
                                </Space>
                            </div>

                            <Divider style={{ margin: '8px 0' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {card.executorName && (
                                    <Text style={{ fontSize: 12 }}>
                                        <UserOutlined /> Исп: <Text strong>{card.executorName}</Text>
                                    </Text>
                                )}
                                {card.masterName && (
                                    <Text style={{ fontSize: 11, color: '#888' }}>
                                        Мастер: {card.masterName}
                                    </Text>
                                )}
                            </div>

                            <div style={{ marginTop: 12, textAlign: 'right' }}>
                                <Text strong style={{ color: '#1890ff' }}>{card.totalAmount.toLocaleString()} ₽</Text>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        );
    };

    if (loading && !data) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" tip="Загрузка доски..." />
            </div>
        );
    }

    const stagesToRender = [
        'NEW', 'ASSIGNED_TO_MASTER', 'ASSIGNED_TO_EXECUTOR', 'IN_PROGRESS',
        'PAINTING', 'POLISHING', 'ASSEMBLY_STAGE', 'READY'
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>График загрузки</Title>
                <Button type="primary" ghost onClick={fetchLoadChart}>Обновить</Button>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    overflowX: 'auto',
                    paddingBottom: 16,
                    flex: 1
                }}
            >
                {data && stagesToRender.map(status => renderColumn(status, data.stages[status] || []))}
            </div>
        </div>
    );
};

export default LoadChartPage;
