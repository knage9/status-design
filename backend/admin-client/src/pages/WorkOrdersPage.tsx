import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, App, Radio, Space, Flex, Typography, FloatButton, Grid, Divider, Popover, Input, Select, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CarOutlined, UserOutlined, CalendarOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
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
    const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('my');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [managerFilter, setManagerFilter] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const { notification, modal } = App.useApp();
    const navigate = useNavigate();
    const { user, activeProfileId, profileChangeToken, isAuthenticated, isLoading: authLoading, isSwitchingProfile } = useAuth();
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
            setFilteredWorkOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch work orders:', error);
            notification.error({ title: 'Ошибка загрузки заказ-нарядов' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (source?: WorkOrder[]) => {
        const list = source || workOrders;
        let result = [...list];

        if (statusFilter) {
            result = result.filter(o => o.status === statusFilter);
        }

        if (dateRangeFilter && dateRangeFilter[0] && dateRangeFilter[1]) {
            const startDate = dateRangeFilter[0].startOf('day').toISOString();
            const endDate = dateRangeFilter[1].endOf('day').toISOString();
            result = result.filter(o => {
                const created = new Date(o.createdAt).toISOString();
                return created >= startDate && created <= endDate;
            });
        }

        if (managerFilter) {
            result = result.filter(o => o.manager?.name === managerFilter);
        }

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            result = result.filter(o =>
                o.customerName.toLowerCase().includes(searchLower) ||
                o.customerPhone.toLowerCase().includes(searchLower) ||
                o.orderNumber.toLowerCase().includes(searchLower)
            );
        }

        setFilteredWorkOrders(result);
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
        if (authLoading || !isAuthenticated) return;
        fetchWorkOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, activeProfileId, profileChangeToken, authLoading, isAuthenticated]);

    useEffect(() => {
        if (isSwitchingProfile) {
            setLoading(true);
        }
    }, [isSwitchingProfile]);

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, dateRangeFilter, managerFilter, searchText, workOrders]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NEW: 'blue',
            ASSIGNED_TO_MASTER: 'cyan',
            ASSIGNED_TO_EXECUTOR: 'purple',
            IN_PROGRESS: 'orange',
            ASSEMBLED: 'green',
            SENT: 'blue',
            ISSUED: 'green',
            COMPLETED: 'default',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            NEW: 'Новый',
            ASSIGNED_TO_MASTER: 'У мастера',
            ASSIGNED_TO_EXECUTOR: 'У исполнителей',
            IN_PROGRESS: 'В работе',
            ASSEMBLED: 'Собран',
            SENT: 'Отправлен',
            ISSUED: 'Выдан',
            COMPLETED: 'Завершён',
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
                            {typeof order.totalAmount === 'number'
                            ? order.totalAmount.toLocaleString('ru-RU')
                            : '—'} ₽ · {getPaymentMethodText(order.paymentMethod || '')}
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
                render: (amount: number) => (
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
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} md={6}>
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="Поиск: клиент/телефон/№ ЗН"
                                value={searchText}
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Статус"
                                allowClear
                                value={statusFilter}
                                style={{ width: '100%' }}
                                onChange={(value) => setStatusFilter(value || null)}
                            >
                                <Select.Option value="NEW">Новый</Select.Option>
                                <Select.Option value="ASSIGNED_TO_MASTER">Назначен мастеру</Select.Option>
                                <Select.Option value="ASSIGNED_TO_EXECUTOR">Назначен исполнителю</Select.Option>
                                <Select.Option value="IN_PROGRESS">В работе</Select.Option>
                                <Select.Option value="COMPLETED">Завершен</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <DatePicker.RangePicker
                                style={{ width: '100%' }}
                                value={dateRangeFilter}
                                onChange={(dates) => setDateRangeFilter(dates as any)}
                                format="DD.MM.YYYY"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Ответственный менеджер"
                                allowClear
                                value={managerFilter}
                                style={{ width: '100%' }}
                                onChange={(value) => setManagerFilter(value || null)}
                            >
                                {Array.from(new Set(workOrders.map(o => o.manager?.name).filter(Boolean))).map(name => (
                                    <Select.Option key={name as string} value={name as string}>{name}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Card>

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
                        ) : filteredWorkOrders.length > 0 ? (
                            filteredWorkOrders.map(order => (
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
                        dataSource={filteredWorkOrders}
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
