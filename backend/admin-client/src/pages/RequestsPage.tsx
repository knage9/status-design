import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Flex, Card, App, Modal, Form, Input, Select, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, PhoneOutlined, CarOutlined, EyeOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

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
    startedAt?: string;
    completedAt?: string;
    manager?: {
        name: string;
    };
}

const RequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<Request | null>(null);
    const { notification, modal } = App.useApp();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/requests/admin');
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            notification.error({ title: 'Ошибка загрузки заявок' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreate = () => {
        setEditingRequest(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (request: Request) => {
        setEditingRequest(request);
        form.setFieldsValue({
            name: request.name,
            phone: request.phone,
            carModel: request.carModel,
            mainService: request.mainService,
            additionalServices: request.additionalServices,
            discount: request.discount,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                name: values.name,
                phone: values.phone,
                carModel: values.carModel,
                mainService: values.mainService || null,
                additionalServices: values.additionalServices || [],
                discount: parseInt(values.discount) || 0,
            };

            if (editingRequest) {
                await axios.patch(`http://localhost:3000/api/requests/admin/${editingRequest.id}`, data);
                notification.success({ title: 'Заявка обновлена' });
            } else {
                await axios.post('http://localhost:3000/api/requests', {
                    ...data,
                    source: 'POPUP',
                });
                notification.success({ title: 'Заявка создана! Номер присвоен автоматически.' });
            }

            setModalOpen(false);
            form.resetFields();
            setEditingRequest(null);
            fetchRequests();
        } catch (error: any) {
            console.error('Submit error:', error.response?.data);
            notification.error({ title: error.response?.data?.message || 'Ошибка сохранения' });
        }
    };

    const handleDelete = (id: number) => {
        modal.confirm({
            title: 'Удалить заявку?',
            content: 'Это действие нельзя отменить.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`http://localhost:3000/api/requests/admin/${id}`);
                    notification.success({ title: 'Заявка удалена' });
                    fetchRequests();
                } catch (error) {
                    notification.error({ title: 'Ошибка удаления' });
                }
            },
        });
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
            CONTACTS_PAGE: 'Контакты',
            DISCOUNT_POPUP: 'Скидка',
        };
        return texts[source] || source;
    };

    const getServiceName = (serviceKey: string | null) => {
        if (!serviceKey) return '—';
        const serviceMap: Record<string, string> = {
            carbon: 'Карбон',
            antichrome: 'Антихром',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Колесные диски',
            cleaning: 'Химчистка',
            ceramic: 'Керамика',
            polish: 'Полировка',
        };
        return serviceMap[serviceKey] || serviceKey;
    };

    const getElapsedTime = (startedAt?: string, completedAt?: string) => {
        if (!startedAt) return null;

        const start = new Date(startedAt);
        const end = completedAt ? new Date(completedAt) : new Date();
        const diff = end.getTime() - start.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}ч ${minutes}м`;
    };

    const columns = [
        {
            title: '№',
            dataIndex: 'requestNumber',
            key: 'requestNumber',
            width: 100,
            render: (num: string) => <strong>{num}</strong>,
        },
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: 'Телефон',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone: string) => (
                <Flex gap="small" align="center">
                    <PhoneOutlined />
                    <span>{phone}</span>
                </Flex>
            ),
        },
        {
            title: 'Автомобиль',
            dataIndex: 'carModel',
            key: 'carModel',
            width: 150,
            render: (car: string) => (
                <Flex gap="small" align="center">
                    <CarOutlined />
                    <span>{car}</span>
                </Flex>
            ),
        },
        {
            title: 'Услуга',
            dataIndex: 'mainService',
            key: 'mainService',
            width: 150,
            render: (service: string | null) => getServiceName(service),
        },
        {
            title: 'Источник',
            dataIndex: 'source',
            key: 'source',
            width: 120,
            render: (source: string) => getSourceText(source),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            filters: [
                { text: 'Новая', value: 'NEW' },
                { text: 'В работе', value: 'IN_PROGRESS' },
                { text: 'Завершена', value: 'COMPLETED' },
                { text: 'Закрыта', value: 'CLOSED' },
            ],
            onFilter: (value: any, record: Request) => record.status === value,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
            ),
        },
        {
            title: 'Ответственный',
            dataIndex: 'manager',
            key: 'manager',
            width: 150,
            render: (manager?: { name: string }) => manager?.name || '—',
        },
        {
            title: 'Время',
            key: 'time',
            width: 100,
            render: (_: any, record: Request) => {
                const time = getElapsedTime(record.startedAt, record.completedAt);
                return time ? (
                    <Tag icon={<ClockCircleOutlined />} color="blue">
                        {time}
                    </Tag>
                ) : '—';
            },
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            sorter: (a: Request, b: Request) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            defaultSortOrder: 'descend' as const,
            render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 200,
            render: (_: any, record: Request) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/requests/${record.id}`)}
                    >
                        Открыть
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Изменить
                    </Button>
                    <Button
                        type="text"
                        danger
                        size="small"
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Создать заявку
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    scroll={{ x: 1700 }}
                />
            </Card>

            <Modal
                title={editingRequest ? 'Редактировать заявку' : 'Создать заявку'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingRequest(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {!editingRequest && (
                        <div style={{
                            padding: '12px',
                            background: '#e6f4ff',
                            border: '1px solid #91caff',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <strong>💡 Подсказка:</strong> Номер заявки будет присвоен автоматически в формате ДД/ММ-N (например: 8/12-1)
                        </div>
                    )}

                    <Form.Item
                        name="name"
                        label="Имя клиента"
                        rules={[{ required: true, message: 'Введите имя' }]}
                    >
                        <Input placeholder="Иван Иванов" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Телефон"
                        rules={[{ required: true, message: 'Введите телефон' }]}
                    >
                        <Input placeholder="+7 (999) 123-45-67" />
                    </Form.Item>

                    <Form.Item
                        name="carModel"
                        label="Модель автомобиля"
                        rules={[{ required: true, message: 'Введите модель' }]}
                    >
                        <Input placeholder="BMW X5" />
                    </Form.Item>

                    <Form.Item name="mainService" label="Основная услуга">
                        <Select placeholder="Выберите услугу" allowClear>
                            <Select.Option value="carbon">Карбон</Select.Option>
                            <Select.Option value="antichrome">Антихром</Select.Option>
                            <Select.Option value="ceramic">Керамика</Select.Option>
                            <Select.Option value="antigravity-film">Антигравийная пленка</Select.Option>
                            <Select.Option value="disk-painting">Покраска дисков</Select.Option>
                            <Select.Option value="polish">Полировка</Select.Option>
                            <Select.Option value="cleaning">Химчистка</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="additionalServices" label="Дополнительные услуги">
                        <Select mode="multiple" placeholder="Выберите доп. услуги" allowClear>
                            <Select.Option value="ceramic">Керамика</Select.Option>
                            <Select.Option value="antigravity-film">Антигравийная пленка</Select.Option>
                            <Select.Option value="disk-painting">Покраска дисков</Select.Option>
                            <Select.Option value="polish">Полировка</Select.Option>
                            <Select.Option value="cleaning">Химчистка</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="discount" label="Скидка (%)" initialValue={0}>
                        <Input type="number" min={0} max={100} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RequestsPage;
