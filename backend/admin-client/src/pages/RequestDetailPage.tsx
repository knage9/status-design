import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Space, App, Spin, Table, Divider, Grid, Flex, Typography, Modal, Form, Input, DatePicker, theme } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined, PlusOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';

const { Text } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

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
    arrivalDate?: string;
    managerComment?: string;
    manager?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    workOrders?: WorkOrder[];
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
    const { token } = useToken();
    const isDarkMode = token.colorBgBase === '#141414' || document.documentElement.getAttribute('data-theme') === 'dark';
    const [request, setRequest] = useState<Request | null>(null);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusAction, setStatusAction] = useState<'SDELKA' | 'OTKLONENO' | null>(null);
    const [statusForm] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/requests/${id}`);
            setRequest(response.data);

            // Fetch work orders for this request (если они уже включены в response.data.workOrders)
            if (response.data.workOrders) {
                setWorkOrders(response.data.workOrders);
            } else {
                // Fallback: загружаем отдельно
                const woResponse = await api.get(`/work-orders/admin`);
                const requestWorkOrders = woResponse.data.filter((wo: any) => wo.requestId === parseInt(id!));
                setWorkOrders(requestWorkOrders);
            }
        } catch (error) {
            notification.error({ title: 'Ошибка загрузки заявки' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const handleDeal = () => {
        setStatusAction('SDELKA');
        statusForm.resetFields();
        setIsStatusModalOpen(true);
    };

    const handleReject = () => {
        setStatusAction('OTKLONENO');
        statusForm.resetFields();
        setIsStatusModalOpen(true);
    };

    const handleStatusSubmit = async (values: any) => {
        if (!statusAction || !request) return;

        try {
            const data: any = {
                status: statusAction,
                managerComment: values.managerComment,
            };

            if (statusAction === 'SDELKA') {
                if (!values.arrivalDate) {
                    notification.error({
                        title: 'Ошибка',
                        description: 'Дата и время приезда обязательны для статуса "Сделка"'
                    });
                    return;
                }
                data.arrivalDate = values.arrivalDate.toISOString();
            }

            await api.patch(`/requests/${request.id}/status`, data);
            notification.success({
                title: 'Статус изменен',
                description: statusAction === 'SDELKA' ? 'Заявка переведена в статус "Сделка"' : 'Заявка отклонена'
            });
            setIsStatusModalOpen(false);
            statusForm.resetFields();
            setStatusAction(null);
            fetchRequest();
        } catch (error: any) {
            notification.error({
                title: 'Ошибка изменения статуса',
                description: error.response?.data?.message || 'Не удалось изменить статус заявки'
            });
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NOVA: 'orange',
            SDELKA: 'cyan',
            OTKLONENO: 'red',
            ZAVERSHENA: 'green',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            NOVA: 'Новая',
            SDELKA: 'Сделка',
            OTKLONENO: 'Отклонено',
            ZAVERSHENA: 'Завершена',
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

    const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
    const isMaster = user?.role === 'MASTER';
    const canDeal = request.status === 'NOVA' && isManager;
    const canReject = request.status === 'NOVA' && isManager;

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
        <Space orientation={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }} wrap>
            {canDeal && (
                <>
                    <Button
                        type="primary"
                        style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                        size={isMobile ? 'large' : 'middle'}
                        icon={<CheckOutlined />}
                        onClick={handleDeal}
                    >
                        Сделка
                    </Button>
                    <Button
                        danger
                        size={isMobile ? 'large' : 'middle'}
                        icon={<CloseOutlined />}
                        onClick={handleReject}
                    >
                        Отклонено
                    </Button>
                </>
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

                    {!isMaster && (
                        <Descriptions.Item label="Источник">
                            {getSourceText(request.source)}
                        </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Статус">
                        <Tag color={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                        </Tag>
                    </Descriptions.Item>

                    {!isMaster && (
                        <Descriptions.Item label="Дата создания" span={isMobile ? 1 : 2}>
                            {new Date(request.createdAt).toLocaleString('ru-RU')}
                        </Descriptions.Item>
                    )}

                    {request.arrivalDate && (
                        <Descriptions.Item label="Дата приезда" span={isMobile ? 1 : 2}>
                            <Tag color="cyan" icon={<ClockCircleOutlined />}>
                                {dayjs(request.arrivalDate).format('DD.MM.YYYY HH:mm')}
                            </Tag>
                        </Descriptions.Item>
                    )}

                    {request.managerComment && (
                        <Descriptions.Item 
                            label={request.status === 'OTKLONENO' ? 'Причина отклонения' : 'Комментарий менеджера'} 
                            span={isMobile ? 1 : 2}
                        >
                            <Card size="small" style={{ 
                                backgroundColor: request.status === 'OTKLONENO' 
                                    ? (isDarkMode ? 'rgba(255, 77, 79, 0.15)' : '#fff1f0')
                                    : (isDarkMode ? 'rgba(82, 196, 26, 0.15)' : '#f6ffed')
                            }}>
                                <Text>{request.managerComment}</Text>
                            </Card>
                        </Descriptions.Item>
                    )}

                    {request.status === 'SDELKA' && !request.managerComment && (
                        <Descriptions.Item label="Комментарий менеджера" span={isMobile ? 1 : 2}>
                            <Text type="secondary">Комментарий не указан</Text>
                        </Descriptions.Item>
                    )}

                    {request.manager && (
                        <Descriptions.Item label="Ответственный" span={isMobile ? 1 : 2}>
                            {request.manager.name} ({request.manager.email})
                            {request.manager.phone && `, ${request.manager.phone}`}
                        </Descriptions.Item>
                    )}

                    {!isMaster && request.startedAt && (
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

                {isMaster && request.status === 'SDELKA' && (
                    <>
                        <Divider titlePlacement={isMobile ? 'center' : 'left'}>Информация для мастера</Divider>
                        <Card type="inner" style={{ marginBottom: 16 }}>
                            <Text strong>Дата приезда клиента: </Text>
                            <Tag color="cyan" icon={<ClockCircleOutlined />} style={{ marginLeft: 8 }}>
                                {request.arrivalDate ? dayjs(request.arrivalDate).format('DD.MM.YYYY HH:mm') : 'Не указана'}
                            </Tag>
                            {request.managerComment && (
                                <div style={{ marginTop: 12 }}>
                                    <Text strong>Комментарий менеджера: </Text>
                                    <Text>{request.managerComment}</Text>
                                </div>
                            )}
                        </Card>
                    </>
                )}

                <Divider titlePlacement={isMobile ? 'center' : 'left'}>Заказ-наряды</Divider>

                <>
                    {(isManager || isMaster) && request.status === 'SDELKA' && (
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/work-orders/new?requestId=${id}`)}
                            style={{ marginBottom: 16, width: isMobile ? '100%' : 'auto' }}
                            size={isMobile ? 'large' : 'middle'}
                        >
                            Создать заказ-наряд
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
            {isMobile && canDeal && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: isDarkMode ? token.colorBgContainer : '#fff',
                        borderTop: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}`,
                        padding: '12px 16px',
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                        zIndex: 100
                    }}
                >
                    {actionButtons}
                </div>
            )}

            {/* Status Change Modal */}
            <Modal
                title={statusAction === 'SDELKA' ? 'Перевести в статус "Сделка"' : 'Отклонить заявку'}
                open={isStatusModalOpen}
                onCancel={() => {
                    setIsStatusModalOpen(false);
                    statusForm.resetFields();
                    setStatusAction(null);
                }}
                footer={null}
                width={isMobile ? '100%' : 600}
                style={isMobile ? { top: 0, maxWidth: '100%', padding: 0 } : undefined}
            >
                <Form
                    form={statusForm}
                    layout="vertical"
                    onFinish={handleStatusSubmit}
                >
                    <Form.Item
                        name="managerComment"
                        label={statusAction === 'OTKLONENO' ? 'Причина отклонения' : 'Комментарий менеджера'}
                        rules={[{ required: true, message: 'Комментарий обязателен' }]}
                    >
                        <Input.TextArea 
                            rows={4} 
                            placeholder={statusAction === 'OTKLONENO' ? 'Введите причину отклонения заявки' : 'Введите комментарий об отработке заявки'} 
                        />
                    </Form.Item>

                    {statusAction === 'SDELKA' && (
                        <Form.Item
                            name="arrivalDate"
                            label="Дата и время приезда клиента"
                            rules={[{ required: true, message: 'Дата и время приезда обязательны' }]}
                        >
                            <DatePicker
                                showTime
                                format="DD.MM.YYYY HH:mm"
                                style={{ width: '100%' }}
                                placeholder="Выберите дату и время приезда"
                            />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setIsStatusModalOpen(false);
                                statusForm.resetFields();
                                setStatusAction(null);
                            }}>
                                Отмена
                            </Button>
                            <Button type="primary" htmlType="submit" danger={statusAction === 'OTKLONENO'}>
                                {statusAction === 'SDELKA' ? 'Перевести в статус "Сделка"' : 'Отклонить'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RequestDetailPage;
