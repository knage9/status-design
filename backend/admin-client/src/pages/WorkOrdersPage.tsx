import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, App, Radio, Space, Flex, Typography, FloatButton, Grid, Divider, Popover } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CarOutlined, UserOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../auth/AuthContext';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface WorkOrder {
    id: number;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    carBrand: string;
    carModel: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    manager?: { name: string };
    master?: { name: string };
    executor?: { name: string };
}

const WorkOrdersPage: React.FC = () => {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('my');
    const { notification, modal } = App.useApp();
    const navigate = useNavigate();
    const { user } = useAuth();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px
    const isTablet = screens.md && !screens.lg; // 768px - 992px

    const isExecutor = user?.role === 'EXECUTOR' || user?.role === 'PAINTER';
    const isMaster = user?.role === 'MASTER';
    const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    useEffect(() => {
        if (isExecutor || isMaster) {
            setViewMode('my');
        }
    }, [isExecutor, isMaster]);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/work-orders/admin?view=${viewMode}`);
            setWorkOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch work orders:', error);
            notification.error({ title: 'Ошибка загрузки заказ-нарядов' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        modal.confirm({
            title: 'Удалить заказ-наряд?',
            content: 'Это действие нельзя отменить.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`/api/work-orders/${id}`);
                    notification.success({ title: 'Заказ-наряд удален' });
                    fetchWorkOrders();
                } catch (error) {
                    notification.error({ title: 'Ошибка удаления' });
                }
            },
        });
    };

    useEffect(() => {
        fetchWorkOrders();
    }, [viewMode]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NEW: 'blue',
            ASSIGNED_TO_MASTER: 'cyan',
            ASSIGNED_TO_EXECUTOR: 'purple',
            IN_PROGRESS: 'orange',
            UNDER_REVIEW: 'gold',
            APPROVED: 'green',
            RETURNED_FOR_REVISION: 'red',
            COMPLETED: 'default',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            NEW: 'Новый',
            ASSIGNED_TO_MASTER: 'Назначен мастеру',
            ASSIGNED_TO_EXECUTOR: 'Назначен исполнителю',
            IN_PROGRESS: 'В работе',
            UNDER_REVIEW: 'На проверке',
            APPROVED: 'Одобрен',
            RETURNED_FOR_REVISION: 'Возвращен на доработку',
            COMPLETED: 'Завершен',
        };
        return texts[status] || status;
    };

    const getPaymentMethodText = (method: string) => {
        const texts: Record<string, string> = {
            CASH: 'Наличные',
            NON_CASH: 'Безналичные',
            WITHOUT_VAT: 'Без НДС',
        };
        return texts[method] || method;
    };

    // Mobile Card Component
    const MobileWorkOrderCard = ({ order }: { order: WorkOrder }) => (
        <Card
            size="small"
            style={{ marginBottom: 12 }}
            hoverable
            onClick={() => navigate(`/work-orders/${order.id}`)}
        >
            <Flex vertical gap={8}>
                <Flex justify="space-between" align="start">
                    <div>
                        <Text strong style={{ fontSize: 16 }}>{order.orderNumber}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <CalendarOutlined /> {dayjs(order.createdAt).format('DD.MM.YYYY HH:mm')}
                        </Text>
                    </div>
                    <Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>
                </Flex>

                <Divider style={{ margin: '8px 0' }} />

                <Flex vertical gap={4}>
                    <Text>
                        <UserOutlined /> {order.customerName}
                    </Text>
                    <Text>
                        <CarOutlined /> {order.carBrand} {order.carModel}
                    </Text>
                    {order.master && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Мастер: {order.master.name}
                        </Text>
                    )}
                    {isManager && (
                        <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                            {order.totalAmount.toLocaleString('ru-RU')} ₽ · {getPaymentMethodText(order.paymentMethod)}
                        </Text>
                    )}
                </Flex>

                <Flex gap={8} style={{ marginTop: 8 }}>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        block
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/work-orders/${order.id}`);
                        }}
                    >
                        Открыть
                    </Button>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(order.id);
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Card>
    );

    const columns = [
        {
            title: '№ Заказ-наряда',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: isTablet ? 120 : 150,
            render: (num: string) => <strong>{num}</strong>,
        },
        {
            title: 'Заказчик',
            dataIndex: 'customerName',
            key: 'customerName',
            width: isTablet ? 120 : 150,
        },
        {
            title: 'Автомобиль',
            key: 'car',
            width: isTablet ? 120 : 150,
            render: (_: any, record: WorkOrder) => `${record.carBrand} ${record.carModel}`,
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: isTablet ? 140 : 180,
            filters: [
                { text: 'Новый', value: 'NEW' },
                { text: 'Назначен мастеру', value: 'ASSIGNED_TO_MASTER' },
                { text: 'В работе', value: 'IN_PROGRESS' },
                { text: 'На проверке', value: 'UNDER_REVIEW' },
                { text: 'Завершен', value: 'COMPLETED' },
            ],
            onFilter: (value: any, record: WorkOrder) => record.status === value,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
            ),
        },
        {
            title: 'Менеджер',
            dataIndex: 'manager',
            key: 'manager',
            width: 120,
            render: (manager?: { name: string }) => manager?.name || '—',
        },
        {
            title: 'Мастер',
            dataIndex: 'master',
            key: 'master',
            width: 120,
            render: (master?: { name: string }) => master?.name || '—',
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: isTablet ? 130 : 150,
            sorter: (a: WorkOrder, b: WorkOrder) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            defaultSortOrder: 'descend' as const,
            render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: isTablet ? 100 : 120,
            render: (_: any, record: WorkOrder) => (
                <Space>
                    <Button
                        type="primary"
                        size={isTablet ? 'small' : 'middle'}
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/work-orders/${record.id}`)}
                    >
                        {!isTablet && 'Открыть'}
                    </Button>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                        <Button
                            type="text"
                            danger
                            size={isTablet ? 'small' : 'middle'}
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    )}
                </Space>
            ),
        },
    ];

    if (isManager && !isTablet) {
        columns.splice(3, 0,
            {
                title: 'Сумма',
                dataIndex: 'totalAmount',
                key: 'totalAmount',
                width: 140,
                render: (amount: number, record: WorkOrder) => (
                    <Space>
                        <Text strong>{amount.toLocaleString('ru-RU')} ₽</Text>
                        <Popover 
                            content={
                                <div>
                                    <Text type="secondary">Детальная информация доступна на странице заказ-наряда</Text>
                                </div>
                            } 
                            title="Состав суммы" 
                            trigger="hover"
                        >
                            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer', fontSize: 14 }} />
                        </Popover>
                    </Space>
                ),
            } as any,
            {
                title: 'Оплата',
                dataIndex: 'paymentMethod',
                key: 'paymentMethod',
                width: 120,
                render: (method: string) => getPaymentMethodText(method),
            } as any
        );
    }

    return (
        <div>
            <Card
                title={isMobile ? "Заказ-наряды" : "Заказ-наряды"}
                extra={
                    !isMobile && (
                        <Space wrap>
                            <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)} buttonStyle="solid">
                                <Radio.Button value="my">Мои</Radio.Button>
                                {!isExecutor && !isMaster && <Radio.Button value="all">Все</Radio.Button>}
                            </Radio.Group>
                            {!isExecutor && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate('/work-orders/new')}
                                >
                                    Создать заказ-наряд
                                </Button>
                            )}
                        </Space>
                    )
                }
            >
                {/* Mobile filters */}
                {isMobile && (
                    <Flex vertical gap={12} style={{ marginBottom: 16 }}>
                        <Radio.Group
                            value={viewMode}
                            onChange={e => setViewMode(e.target.value)}
                            buttonStyle="solid"
                            style={{ width: '100%' }}
                        >
                            <Radio.Button value="my" style={{ width: '50%', textAlign: 'center' }}>Мои</Radio.Button>
                            {!isExecutor && !isMaster && (
                                <Radio.Button value="all" style={{ width: '50%', textAlign: 'center' }}>Все</Radio.Button>
                            )}
                        </Radio.Group>
                    </Flex>
                )}

                {/* Mobile Card List */}
                {isMobile ? (
                    <div>
                        {loading ? (
                            <Card loading={true} />
                        ) : workOrders.length > 0 ? (
                            workOrders.map(order => (
                                <MobileWorkOrderCard key={order.id} order={order} />
                            ))
                        ) : (
                            <Card>
                                <Text type="secondary">Нет заказ-нарядов</Text>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Desktop/Tablet Table */
                    <Table
                        columns={columns}
                        dataSource={workOrders}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 20, showSizeChanger: !isTablet }}
                        scroll={{ x: isTablet ? 1200 : 1500 }}
                        size={isTablet ? 'small' : 'middle'}
                    />
                )}
            </Card>

            {/* FAB for mobile */}
            {isMobile && !isExecutor && (
                <FloatButton
                    icon={<PlusOutlined />}
                    type="primary"
                    style={{ right: 24, bottom: 24 }}
                    onClick={() => navigate('/work-orders/new')}
                    tooltip="Создать заказ-наряд"
                />
            )}
        </div>
    );
};

export default WorkOrdersPage;
