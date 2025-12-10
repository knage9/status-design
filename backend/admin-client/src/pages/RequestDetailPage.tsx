import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Space, App, Spin, Table, Divider } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined, PlusOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';

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

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/requests/${id}`);
            setRequest(response.data);

            // Fetch work orders for this request
            const woResponse = await axios.get(`http://localhost:3000/api/work-orders/admin`);
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
            await axios.post(`http://localhost:3000/api/requests/admin/${id}/take-to-work`);
            notification.success({ title: 'Заявка взята в работу' });
            fetchRequest();
        } catch (error) {
            notification.error({ title: 'Ошибка' });
        }
    };

    const handleComplete = async () => {
        try {
            await axios.post(`http://localhost:3000/api/requests/admin/${id}/complete`);
            notification.success({ title: 'Заявка завершена' });
            fetchRequest();
        } catch (error) {
            notification.error({ title: 'Ошибка' });
        }
    };

    const handleClose = async () => {
        try {
            await axios.post(`http://localhost:3000/api/requests/admin/${id}/close`);
            notification.success({ title: 'Заявка закрыта' });
            fetchRequest();
        } catch (error) {
            notification.error({ title: 'Ошибка' });
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

    const getElapsedTime = () => {
        if (!request?.startedAt) return null;

        const start = new Date(request.startedAt);
        const end = request.completedAt ? new Date(request.completedAt) : new Date();
        const diff = end.getTime() - start.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}ч ${minutes}м`;
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

    return (
        <div>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/requests')}
                style={{ marginBottom: 16 }}
            >
                Назад к списку
            </Button>

            <Card
                title={`Заявка ${request.requestNumber}`}
                extra={
                    <Space>
                        <Tag color={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                        </Tag>
                        {canTakeToWork && (
                            <Button
                                type="primary"
                                onClick={handleTakeToWork}
                            >
                                Взять в работу
                            </Button>
                        )}
                        {canComplete && (
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={handleComplete}
                            >
                                Завершить
                            </Button>
                        )}
                        {canClose && (
                            <Button
                                icon={<CloseOutlined />}
                                onClick={handleClose}
                            >
                                Закрыть
                            </Button>
                        )}
                    </Space>
                }
            >

                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Номер заявки" span={2}>
                        <strong>{request.requestNumber}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Клиент">
                        {request.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Телефон">
                        {request.phone}
                    </Descriptions.Item>

                    <Descriptions.Item label="Автомобиль" span={2}>
                        {request.carModel}
                    </Descriptions.Item>

                    {request.mainService && (
                        <Descriptions.Item label="Основная услуга" span={2}>
                            {getServiceName(request.mainService)}
                        </Descriptions.Item>
                    )}

                    {request.additionalServices.length > 0 && (
                        <Descriptions.Item label="Дополнительные услуги" span={2}>
                            {request.additionalServices.map(s => getServiceName(s)).join(', ')}
                        </Descriptions.Item>
                    )}

                    {request.discount > 0 && (
                        <Descriptions.Item label="Скидка" span={2}>
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

                    <Descriptions.Item label="Дата создания" span={2}>
                        {new Date(request.createdAt).toLocaleString('ru-RU')}
                    </Descriptions.Item>

                    {request.manager && (
                        <Descriptions.Item label="Ответственный" span={2}>
                            {request.manager.name} ({request.manager.email})
                            {request.manager.phone && `, ${request.manager.phone}`}
                        </Descriptions.Item>
                    )}

                    {request.startedAt && (
                        <Descriptions.Item label="Начало работы" span={2}>
                            {new Date(request.startedAt).toLocaleString('ru-RU')}
                        </Descriptions.Item>
                    )}

                    {request.completedAt && (
                        <Descriptions.Item label="Завершено" span={2}>
                            {new Date(request.completedAt).toLocaleString('ru-RU')}
                        </Descriptions.Item>
                    )}
                </Descriptions>
                <Divider titlePlacement="left">Заказ-наряды</Divider>
                <>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/work-orders/new?requestId=${id}`)}
                            style={{ marginBottom: 16 }}
                        >
                            Добавить еще заказ-наряд
                        </Button>
                    )}

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
                </>

            </Card >
        </div >
    );
};

export default RequestDetailPage;
