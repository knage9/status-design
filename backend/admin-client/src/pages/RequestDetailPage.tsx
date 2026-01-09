import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Space, App, Spin, Table, Divider, Grid, Flex, Typography } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined, PlusOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface Request {
    id: number;
    requestNumber: string;
    name: string;
    phone: string;
    carModel: string;
    mainService?: string;
    additionalServices: string[];
    discount: number;
    source: string;
    status: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    manager?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    arrivalAt?: string;
}

interface WorkOrder {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
}

const RequestDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notification } = App.useApp();
    const [request, setRequest] = useState<Request | null>(null);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/requests/${id}`);
            setRequest(response.data);

            // Fetch work orders for this request
            const woResponse = await axios.get(`/api/work-orders/admin`);
            const requestWorkOrders = woResponse.data.filter((wo: any) => wo.requestId === parseInt(id!));
            setWorkOrders(requestWorkOrders);
        } catch (error) {
            notification.error({ title: 'Ошибка загрузки заявки' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const handleTakeToWork = async () => {
        try {
            await axios.post(`/api/requests/admin/${id}/take-to-work`);
            notification.success({ title: 'Заявка взята в работу' });
            fetchRequest();
        } catch (error) {
            notification.error({ title: 'Ошибка' });
        }
    };

    const handleComplete = async () => {
        try {
            await axios.post(`/api/requests/admin/${id}/complete`);
            notification.success({ title: 'Заявка завершена' });
            fetchRequest();
        } catch (error) {
            notification.error({ title: 'Ошибка' });
        }
    };

    const handleClose = async () => {
        try {
            await axios.post(`/api/requests/admin/${id}/close`);
            notification.success({ title: 'Заявка закрыта' });
            fetchRequest();
        } catch (error) {
            notification.error({ title: 'Ошибка' });
        }
    };

    const handleDeal = async () => {
        try {
            await axios.patch(`/api/requests/admin/${id}`, { status: 'SDELKA' });
            notification.success({ title: 'Статус изменен на "Сделка"' });
            fetchRequest();
        } catch (error) {
            notification.error({ title: 'Ошибка изменения статуса' });
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NEW: 'blue',
            IN_PROGRESS: 'orange',
            COMPLETED: 'green',
            CLOSED: 'default',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            NEW: 'Новая',
            IN_PROGRESS: 'В работе',
            COMPLETED: 'Завершена',
            CLOSED: 'Закрыта',
            SDELKA: 'Сделка',
        };
        return texts[status] || status;
    };

    const getSourceText = (source: string) => {
        const texts: Record<string, string> = {
            POPUP: 'Попап',
            CONTACTS_PAGE: 'Страница контактов',
            DISCOUNT_POPUP: 'Попап скидки',
        };
        return texts[source] || source;
    };

    const getServiceName = (service: string) => {
        const names: Record<string, string> = {
            carbon: 'Карбон',
            antichrome: 'Антихром',
            ceramic: 'Керамика',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Покраска дисков',
            polish: 'Полировка',
            cleaning: 'Химчистка',
        };
        return names[service] || service;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!request) {
        return <div>Заявка не найдена</div>;
    }

    const canTakeToWork = request.status === 'NEW' && user?.role === 'MANAGER';
    const canComplete = request.status === 'IN_PROGRESS' && request.manager?.id === user?.id;
    const canClose = request.status === 'COMPLETED' && request.manager?.id === user?.id;
    const canDeal = (request.status === 'NEW' || request.status === 'IN_PROGRESS') && (user?.role === 'MANAGER' || user?.role === 'ADMIN');
    const isMaster = user?.role === 'MASTER';

    const WorkOrderMobileCard = ({ wo }: { wo: WorkOrder }) => {
        const statusColors: Record<string, string> = {
            NEW: 'blue',
            IN_PROGRESS: 'orange',
            COMPLETED: 'green',
        };
        const statusTexts: Record<string, string> = {
            NEW: 'Новый',
            ASSIGNED_TO_MASTER: 'Назначен мастеру',
            IN_PROGRESS: 'В работе',
            UNDER_REVIEW: 'На проверке',
            COMPLETED: 'Завершен',
        };

        return (
            <Card
                size="small"
                style={{ marginBottom: 12 }}
                hoverable
                onClick={() => navigate(`/work-orders/${wo.id}`)}
            >
                <Flex vertical gap={8}>
                    <Flex justify="space-between" align="center">
                        <Text strong style={{ fontSize: 16 }}>{wo.orderNumber}</Text>
                        <Tag color={statusColors[wo.status] || 'default'}>
                            {statusTexts[wo.status] || wo.status}
                        </Tag>
                    </Flex>
                    <Flex justify="space-between" align="center">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined /> {dayjs(wo.createdAt).format('DD.MM.YYYY HH:mm')}
                        </Text>
                        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                            <DollarOutlined /> {wo.totalAmount.toLocaleString('ru-RU')} ₽
                        </Text>
                    </Flex>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="large"
                        block
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/work-orders/${wo.id}`);
                        }}
                    >
                        Открыть
                    </Button>
                </Flex>
            </Card>
        );
    };

    const actionButtons = (
        <Space orientation={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }}>
            {canDeal && (
                <Button
                    type="primary"
                    style={{ backgroundColor: '#722ed1', width: isMobile ? '100%' : 'auto' }}
                    size={isMobile ? 'large' : 'middle'}
                    onClick={handleDeal}
                >
                    Сделка
                </Button>
            )}
            {canTakeToWork && (
                <Button
                    type="primary"
                    size={isMobile ? 'large' : 'middle'}
                    onClick={handleTakeToWork}
                    block={isMobile}
                >
                    Взять в работу
                </Button>
            )}
            {canComplete && (
                <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    size={isMobile ? 'large' : 'middle'}
                    onClick={handleComplete}
                    block={isMobile}
                >
                    Завершить
                </Button>
            )}
            {canClose && (
                <Button
                    icon={<CloseOutlined />}
                    size={isMobile ? 'large' : 'middle'}
                    onClick={handleClose}
                    block={isMobile}
                >
                    Закрыть
                </Button>
            )}
        </Space>
    );

    return (
        <div style={{ paddingBottom: isMobile ? 80 : 0 }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/requests')}
                style={{ marginBottom: 16 }}
                size={isMobile ? 'large' : 'middle'}
            >
                Назад к списку
            </Button>

            <Card
                title={
                    <Flex vertical={isMobile} justify="space-between" align={isMobile ? 'start' : 'center'} gap={8}>
                        <span>{`Заявка ${request.requestNumber}`}</span>
                        <Tag color={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                        </Tag>
                    </Flex>
                }
                extra={!isMobile ? actionButtons : null}
            >

                <Descriptions bordered column={isMobile ? 1 : 2} size={isMobile ? 'small' : 'middle'}>
                    <Descriptions.Item label="Номер заявки" span={isMobile ? 1 : 2}>
                        <strong>{request.requestNumber}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Клиент">
                        {request.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Телефон">
                        {request.phone}
                    </Descriptions.Item>

                    <Descriptions.Item label="Автомобиль" span={isMobile ? 1 : 2}>
                        {request.carModel}
                    </Descriptions.Item>

                    {request.mainService && (
                        <Descriptions.Item label="Основная услуга" span={isMobile ? 1 : 2}>
                            {getServiceName(request.mainService)}
                        </Descriptions.Item>
                    )}

                    {request.additionalServices.length > 0 && (
                        <Descriptions.Item label="Дополнительные услуги" span={isMobile ? 1 : 2}>
                            {request.additionalServices.map(s => getServiceName(s)).join(', ')}
                        </Descriptions.Item>
                    )}

                    {request.discount > 0 && (
                        <Descriptions.Item label="Скидка" span={isMobile ? 1 : 2}>
                            {request.discount}%
                        </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Источник">
                        {getSourceText(request.source)}
                    </Descriptions.Item>

                    <Descriptions.Item label="Статус">
                        <Tag color={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Дата создания" span={isMobile ? 1 : 2}>
                        {new Date(request.createdAt).toLocaleString('ru-RU')}
                    </Descriptions.Item>

                    {request.arrivalAt && (
                        <Descriptions.Item label="Дата приезда" span={isMobile ? 1 : 2}>
                            <Tag color="cyan" icon={<ClockCircleOutlined />}>
                                {dayjs(request.arrivalAt).format('DD.MM.YYYY HH:mm')}
                            </Tag>
                        </Descriptions.Item>
                    )}

                    {request.manager && (
                        <Descriptions.Item label="Ответственный" span={isMobile ? 1 : 2}>
                            {request.manager.name} ({request.manager.email})
                            {request.manager.phone && `, ${request.manager.phone}`}
                        </Descriptions.Item>
                    )}

                    {request.startedAt && (
                        <Descriptions.Item label="Начало работы" span={isMobile ? 1 : 2}>
                            {new Date(request.startedAt).toLocaleString('ru-RU')}
                        </Descriptions.Item>
                    )}

                    {request.completedAt && (
                        <Descriptions.Item label="Завершено" span={isMobile ? 1 : 2}>
                            {new Date(request.completedAt).toLocaleString('ru-RU')}
                        </Descriptions.Item>
                    )}
                </Descriptions>

                <Divider titlePlacement={isMobile ? 'center' : 'left'}>Заказ-наряды</Divider>

                <>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || isMaster) && (
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/work-orders/new?requestId=${id}`)}
                            style={{ marginBottom: 16, width: isMobile ? '100%' : 'auto' }}
                            size={isMobile ? 'large' : 'middle'}
                        >
                            Добавить еще заказ-наряд
                        </Button>
                    )}

                    {isMobile ? (
                        /* Mobile Cards */
                        <div>
                            {workOrders.length > 0 ? (
                                workOrders.map(wo => (
                                    <WorkOrderMobileCard key={wo.id} wo={wo} />
                                ))
                            ) : (
                                <Card>
                                    <Text type="secondary">Нет заказ-нарядов</Text>
                                </Card>
                            )}
                        </div>
                    ) : (
                        /* Desktop Table */
                        <Table
                            size="small"
                            dataSource={workOrders}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                {
                                    title: 'Номер',
                                    dataIndex: 'orderNumber',
                                    key: 'orderNumber',
                                    render: (num: string) => <strong>{num}</strong>,
                                },
                                {
                                    title: 'Статус',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status: string) => {
                                        const colors: Record<string, string> = {
                                            NEW: 'blue',
                                            IN_PROGRESS: 'orange',
                                            COMPLETED: 'green',
                                        };
                                        const texts: Record<string, string> = {
                                            NEW: 'Новый',
                                            ASSIGNED_TO_MASTER: 'Назначен мастеру',
                                            IN_PROGRESS: 'В работе',
                                            UNDER_REVIEW: 'На проверке',
                                            COMPLETED: 'Завершен',
                                        };
                                        return <Tag color={colors[status] || 'default'}>{texts[status] || status}</Tag>;
                                    },
                                },
                                {
                                    title: 'Сумма',
                                    dataIndex: 'totalAmount',
                                    key: 'totalAmount',
                                    render: (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`,
                                },
                                {
                                    title: 'Дата создания',
                                    dataIndex: 'createdAt',
                                    key: 'createdAt',
                                    render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
                                },
                                {
                                    title: 'Действия',
                                    key: 'actions',
                                    render: (_: any, record: WorkOrder) => (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => navigate(`/work-orders/${record.id}`)}
                                        >
                                            Открыть
                                        </Button>
                                    ),
                                },
                            ]}
                        />
                    )}
                </>

            </Card>

            {/* Sticky Action Bar for Mobile */}
            {isMobile && (canDeal || canTakeToWork || canComplete || canClose) && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: '#fff',
                        borderTop: '1px solid #f0f0f0',
                        padding: '12px 16px',
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                        zIndex: 100
                    }}
                >
                    {actionButtons}
                </div>
            )}
        </div>
    );
};

export default RequestDetailPage;
