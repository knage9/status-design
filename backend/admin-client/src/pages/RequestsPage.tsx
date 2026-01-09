import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Flex, Card, App, Modal, Form, Input, Select, Space, DatePicker, Typography, FloatButton, Grid, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, PhoneOutlined, CarOutlined, EyeOutlined, ClockCircleOutlined, EditOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../auth/AuthContext';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface Request {
    id: number;
    requestNumber: string;
    name: string;
    phone: string;
    carModel: string;
    mainService: string | null;
    additionalServices: string[];
    discount: number;
    source: string;
    status: string;
    createdAt: string;
    arrivalAt?: string;
    startedAt?: string;
    completedAt?: string;
    manager?: {
        name: string;
    };
}

const RequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Request | null>(null);
    const [form] = Form.useForm();
    const { notification, modal } = App.useApp();
    const navigate = useNavigate();
    useAuth();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px
    const isTablet = screens.md && !screens.lg; // 768px - 992px

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/requests/admin');
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            notification.error({
                title: 'Ошибка загрузки заявок',
                description: 'Не удалось загрузить список заявок'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (request: Request) => {
        setEditingRecord(request);
        form.setFieldsValue({
            ...request,
            arrivalAt: request.arrivalAt ? dayjs(request.arrivalAt) : null,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
                arrivalAt: values.arrivalAt ? values.arrivalAt.toISOString() : null,
                discount: values.discount ? Number(values.discount) : 0,
            };

            if (editingRecord) {
                await axios.patch(`/api/requests/admin/${editingRecord.id}`, data);
                notification.success({ title: 'Заявка обновлена' });
            } else {
                await axios.post('/api/requests', data);
                notification.success({ title: 'Заявка создана' });
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchRequests();
        } catch (error) {
            notification.error({ title: 'Ошибка сохранения заявки' });
        }
    };

    const handleDelete = (id: number) => {
        modal.confirm({
            title: 'Удалить заявку?',
            content: 'Это действие нельзя отменить.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`/api/requests/admin/${id}`);
                    notification.success({ title: 'Заявка удалена' });
                    fetchRequests();
                } catch (error) {
                    notification.error({ title: 'Ошибка удаления заявки' });
                }
            },
        });
    };

    const getStatusColor = (status: string) => {
        return { NEW: 'orange', IN_PROGRESS: 'blue', COMPLETED: 'green', CANCELLED: 'red' }[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            NEW: 'Ожидает', IN_PROGRESS: 'В работе', COMPLETED: 'Завершена', CANCELLED: 'Отменена'
        };
        return statusMap[status] || status;
    };

    const getSourceText = (source: string) => {
        const sourceMap: Record<string, string> = {
            WEBSITE: 'Сайт', PHONE: 'Телефон', SOCIAL: 'Соц. сети', OTHER: 'Другое'
        };
        return sourceMap[source] || source;
    };

    const getServiceName = (serviceKey: string | null) => {
        const serviceMap: Record<string, string> = {
            'antichrome': 'Антихром',
            'soundproofing': 'Шумоизоляция',
            'ceramic': 'Керамика',
            'polish': 'Полировка',
            'carbon': 'Карбон',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Колесные диски',
            'cleaning': 'Химчистка'
        };
        return serviceKey ? (serviceMap[serviceKey] || serviceKey) : '—';
    };

    const getElapsedTime = (startedAt?: string, completedAt?: string) => {
        if (!startedAt) return '—';
        const start = dayjs(startedAt);
        const end = completedAt ? dayjs(completedAt) : dayjs();
        const diff = end.diff(start, 'minute');
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}ч ${minutes}м`;
    };

    // Mobile Request Card Component
    const MobileRequestCard = ({ request }: { request: Request }) => (
        <Card
            size="small"
            style={{ marginBottom: 12 }}
            hoverable
            onClick={() => navigate(`/requests/${request.id}`)}
        >
            <Flex vertical gap={8}>
                <Flex justify="space-between" align="start">
                    <div>
                        <Text strong style={{ fontSize: 16 }}>{request.requestNumber}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <CalendarOutlined /> {dayjs(request.createdAt).format('DD.MM.YYYY HH:mm')}
                        </Text>
                    </div>
                    <Tag color={getStatusColor(request.status)}>{getStatusText(request.status)}</Tag>
                </Flex>

                <Divider style={{ margin: '8px 0' }} />

                <Flex vertical gap={4}>
                    <Text>
                        <UserOutlined /> {request.name}
                    </Text>
                    <Text>
                        <PhoneOutlined /> {request.phone}
                    </Text>
                    <Text>
                        <CarOutlined /> {request.carModel}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Услуга: {getServiceName(request.mainService)}
                    </Text>
                    {request.manager && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Менеджер: {request.manager.name}
                        </Text>
                    )}
                </Flex>

                <Flex vertical gap={8} style={{ marginTop: 12 }}>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="large"
                        block
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/requests/${request.id}`);
                        }}
                    >
                        Открыть
                    </Button>
                    <Flex gap={8}>
                        <Button
                            icon={<EditOutlined />}
                            size="large"
                            style={{ flex: 1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(request);
                            }}
                        >
                            Изменить
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="large"
                            style={{ flex: 1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(request.id);
                            }}
                        >
                            Удалить
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    );

    const columns = [
        {
            title: '№ Заявки',
            dataIndex: 'requestNumber',
            key: 'requestNumber',
            width: isTablet ? 100 : 120,
            render: (num: string) => <strong>{num}</strong>,
        },
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
            width: isTablet ? 100 : 120,
        },
        {
            title: 'Телефон',
            dataIndex: 'phone',
            key: 'phone',
            width: isTablet ? 110 : 130,
            render: (phone: string) => (
                <Flex align="center" gap={4}>
                    <PhoneOutlined />
                    <span>{phone}</span>
                </Flex>
            ),
        },
        {
            title: 'Автомобиль',
            dataIndex: 'carModel',
            key: 'carModel',
            width: isTablet ? 110 : 130,
            render: (car: string) => (
                <Flex align="center" gap={4}>
                    <CarOutlined />
                    <span>{car}</span>
                </Flex>
            ),
        },
        {
            title: 'Услуга',
            dataIndex: 'mainService',
            key: 'mainService',
            width: isTablet ? 120 : 150,
            render: (service: string | null) => getServiceName(service),
        },
        {
            title: 'Источник',
            dataIndex: 'source',
            key: 'source',
            width: isTablet ? 90 : 110,
            render: (source: string) => getSourceText(source),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: isTablet ? 100 : 120,
            filters: [
                { text: 'Ожидает', value: 'NEW' },
                { text: 'В работе', value: 'IN_PROGRESS' },
                { text: 'Завершена', value: 'COMPLETED' },
                { text: 'Отменена', value: 'CANCELLED' },
            ],
            onFilter: (value: any, record: Request) => record.status === value,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
            ),
        },
        {
            title: 'Менеджер',
            dataIndex: 'manager',
            key: 'manager',
            width: 110,
            render: (manager?: { name: string }) => manager?.name || '—',
        },
        {
            title: 'Время',
            key: 'time',
            width: isTablet ? 80 : 100,
            render: (_: any, record: Request) => (
                <Flex align="center" gap={4}>
                    <ClockCircleOutlined />
                    <span>{getElapsedTime(record.startedAt, record.completedAt)}</span>
                </Flex>
            ),
        },
        {
            title: 'Создана',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: isTablet ? 110 : 140,
            render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Прибытие',
            dataIndex: 'arrivalAt',
            key: 'arrivalAt',
            width: isTablet ? 110 : 140,
            sorter: (a: Request, b: Request) => {
                if (!a.arrivalAt) return 1;
                if (!b.arrivalAt) return -1;
                return new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime();
            },
            render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—',
        },
        {
            title: 'Действия',
            key: 'actions',
            width: isTablet ? 100 : 150,
            render: (_: any, record: Request) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size={isTablet ? 'small' : 'middle'}
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/requests/${record.id}`)}
                    >
                        {!isTablet && 'Открыть'}
                    </Button>
                    <Button
                        size={isTablet ? 'small' : 'middle'}
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        size={isTablet ? 'small' : 'middle'}
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card
                title="Заявки"
                extra={
                    !isMobile && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Создать заявку
                        </Button>
                    )
                }
            >
                {/* Mobile Card List */}
                {isMobile ? (
                    <div>
                        {loading ? (
                            <Card loading={true} />
                        ) : requests.length > 0 ? (
                            requests.map(request => (
                                <MobileRequestCard key={request.id} request={request} />
                            ))
                        ) : (
                            <Card>
                                <Text type="secondary">Нет заявок</Text>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Desktop/Tablet Table */
                    <Table
                        columns={columns}
                        dataSource={requests}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 20, showSizeChanger: !isTablet }}
                        scroll={{ x: isTablet ? 1400 : 1600 }}
                        size={isTablet ? 'small' : 'middle'}
                    />
                )}
            </Card>

            {/* FAB for mobile */}
            {isMobile && (
                <FloatButton
                    icon={<PlusOutlined />}
                    type="primary"
                    style={{ right: 24, bottom: 24 }}
                    onClick={handleCreate}
                    tooltip="Создать заявку"
                />
            )}

            {/* Create/Edit Modal */}
            <Modal
                title={editingRecord ? 'Редактировать заявку' : 'Создать заявку'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={isMobile ? '100%' : 600}
                style={isMobile ? { top: 0, maxWidth: '100%', padding: 0 } : undefined}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item name="name" label="Имя" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="phone" label="Телефон" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="carModel" label="Автомобиль" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="mainService" label="Основная услуга">
                        <Select>
                            <Select.Option value="antichrome">Антихром</Select.Option>
                            <Select.Option value="soundproofing">Шумоизоляция</Select.Option>
                            <Select.Option value="ceramic">Керамика</Select.Option>
                            <Select.Option value="polish">Полировка</Select.Option>
                            <Select.Option value="carbon">Карбон</Select.Option>
                            <Select.Option value="antigravity-film">Антигравийная пленка</Select.Option>
                            <Select.Option value="disk-painting">Колесные диски</Select.Option>
                            <Select.Option value="cleaning">Химчистка</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="source" label="Источник" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="WEBSITE">Сайт</Select.Option>
                            <Select.Option value="PHONE">Телефон</Select.Option>
                            <Select.Option value="SOCIAL">Соц. сети</Select.Option>
                            <Select.Option value="OTHER">Другое</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="NEW">Ожидает</Select.Option>
                            <Select.Option value="IN_PROGRESS">В работе</Select.Option>
                            <Select.Option value="COMPLETED">Завершена</Select.Option>
                            <Select.Option value="CANCELLED">Отменена</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="arrivalAt" label="Время прибытия">
                        <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="additionalServices" label="Дополнительные услуги">
                        <Select mode="tags" placeholder="Введите услуги">
                            <Select.Option value="antichrome">Антихром</Select.Option>
                            <Select.Option value="soundproofing">Шумоизоляция</Select.Option>
                            <Select.Option value="ceramic">Керамика</Select.Option>
                            <Select.Option value="polish">Полировка</Select.Option>
                            <Select.Option value="carbon">Карбон</Select.Option>
                            <Select.Option value="antigravity-film">Антигравийная пленка</Select.Option>
                            <Select.Option value="disk-painting">Колесные диски</Select.Option>
                            <Select.Option value="cleaning">Химчистка</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="comment" label="Комментарий">
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item name="discount" label="Скидка (%)">
                        <Input type="number" min={0} max={100} />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalOpen(false)}>
                                Отмена
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingRecord ? 'Сохранить' : 'Создать'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RequestsPage;
