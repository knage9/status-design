import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Flex, Card, App, Modal, Form, Input, Select, Space, DatePicker, Typography, FloatButton, Grid, Divider, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, PhoneOutlined, CarOutlined, EyeOutlined, ClockCircleOutlined, EditOutlined, UserOutlined, CalendarOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
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
    arrivalDate?: string;
    startedAt?: string;
    completedAt?: string;
    managerComment?: string;
    manager?: {
        name: string;
    };
}

const RequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Request | null>(null);
    const [filterForm] = Form.useForm();
    const [form] = Form.useForm();
    const { notification, modal } = App.useApp();
    const navigate = useNavigate();
    const { user, activeProfileId, profileChangeToken, isAuthenticated, isLoading: authLoading, isSwitchingProfile } = useAuth();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px
    const isTablet = screens.md && !screens.lg; // 768px - 992px
    const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
    const isMaster = user?.role === 'MASTER';
    
    // Фильтры
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [managerFilter, setManagerFilter] = useState<string | null>(null);
    
    // Инициализация filteredRequests с requests
    useEffect(() => {
        if (requests.length > 0 && filteredRequests.length === 0) {
            setFilteredRequests(requests);
        }
    }, [requests]);

    const fetchRequests = async (searchQueryText?: string) => {
        try {
            setLoading(true);
            const response = await axios.get('/api/requests/admin', {
                params: {
                    searchQuery: searchQueryText !== undefined ? searchQueryText : (searchText || undefined),
                }
            });
            setRequests(response.data);
            // Применяем фильтры к полученным данным сразу
            applyFilters(response.data);
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

    const applyFilters = (requestsToFilter?: Request[]) => {
        const sourceData = requestsToFilter || requests;
        let filtered = [...sourceData];

        // Фильтр по статусу
        if (statusFilter) {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Фильтр по дате создания
        if (dateRangeFilter && dateRangeFilter[0] && dateRangeFilter[1]) {
            const startDate = dateRangeFilter[0].startOf('day').toISOString();
            const endDate = dateRangeFilter[1].endOf('day').toISOString();
            filtered = filtered.filter(r => {
                const createdDate = new Date(r.createdAt).toISOString();
                return createdDate >= startDate && createdDate <= endDate;
            });
        }

        // Фильтр по менеджеру
        if (managerFilter) {
            filtered = filtered.filter(r => r.manager?.name === managerFilter);
        }

        // Локальный поиск по имени/телефону/авто/номеру заявки (если не менеджер или для дополнительной фильтрации)
        // Для менеджера основной поиск уже применен на сервере через API
        if (searchText && !isManager) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(r => 
                r.name.toLowerCase().includes(searchLower) ||
                r.phone.includes(searchText) ||
                r.carModel.toLowerCase().includes(searchLower) ||
                r.requestNumber.toLowerCase().includes(searchLower)
            );
        }

        setFilteredRequests(filtered);
    };

    const handleFilterChange = () => {
        applyFilters();
    };

    const handleClearFilters = () => {
        setStatusFilter(null);
        setDateRangeFilter(null);
        setManagerFilter(null);
        const clearedSearch = '';
        setSearchText(clearedSearch);
        filterForm.resetFields();
        fetchRequests(clearedSearch);
    };

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProfileId, profileChangeToken, authLoading, isAuthenticated]);

    // Применяем фильтры при изменении фильтров или заявок
    useEffect(() => {
        if (requests.length >= 0) {
            applyFilters();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, dateRangeFilter, managerFilter, requests]);

    useEffect(() => {
        if (isSwitchingProfile) {
            setLoading(true);
        }
    }, [isSwitchingProfile]);

    const handleCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (request: Request) => {
        setEditingRecord(request);
        form.setFieldsValue({
            ...request,
            // Не загружаем arrivalDate и managerComment в форму редактирования
            // Эти поля заполняются только при изменении статуса
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
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
        const colors: Record<string, string> = {
            NOVA: 'orange',
            SDELKA: 'cyan',
            OTKLONENO: 'red',
            ZAVERSHENA: 'green',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            NOVA: 'Новая',
            SDELKA: 'Сделка',
            OTKLONENO: 'Отклонено',
            ZAVERSHENA: 'Завершена',
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
                    {request.arrivalDate && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <CalendarOutlined /> Приезд: {dayjs(request.arrivalDate).format('DD.MM.YYYY HH:mm')}
                        </Text>
                    )}
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
                        {(isManager || user?.role === 'ADMIN') && (
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
                        )}
                        {user?.role === 'ADMIN' && (
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
                        )}
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
            filters: isManager ? [
                { text: 'Новая', value: 'NOVA' },
                { text: 'Сделка', value: 'SDELKA' },
                { text: 'Отклонено', value: 'OTKLONENO' },
            ] : isMaster ? [
                { text: 'Сделка', value: 'SDELKA' },
            ] : [
                { text: 'Новая', value: 'NOVA' },
                { text: 'Сделка', value: 'SDELKA' },
                { text: 'Отклонено', value: 'OTKLONENO' },
                { text: 'Завершена', value: 'ZAVERSHENA' },
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
            dataIndex: 'arrivalDate',
            key: 'arrivalDate',
            width: isTablet ? 110 : 140,
            sorter: (a: Request, b: Request) => {
                if (!a.arrivalDate) return 1;
                if (!b.arrivalDate) return -1;
                return new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime();
            },
            render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—',
        },
        {
            title: 'Действия',
            key: 'actions',
            width: isTablet ? 100 : 180,
            render: (_: any, record: Request) => (
                <Space size="small" wrap>
                    <Button
                        type="primary"
                        size={isTablet ? 'small' : 'middle'}
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/requests/${record.id}`)}
                    >
                        {!isTablet && 'Открыть'}
                    </Button>
                    {(isManager || user?.role === 'ADMIN') && (
                        <Button
                            size={isTablet ? 'small' : 'middle'}
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        >
                            {!isTablet && 'Изменить'}
                        </Button>
                    )}
                    {user?.role === 'ADMIN' && (
                        <Button
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

    return (
        <div>
            <Card
                title="Заявки"
                extra={
                    !isMobile && (
                        <Space>
                            {isManager && (
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={handleClearFilters}
                                >
                                    Сбросить фильтры
                                </Button>
                            )}
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                            >
                                Создать заявку
                            </Button>
                        </Space>
                    )
                }
            >
                {/* Фильтры для менеджера */}
                {isManager && (
                    <Card size="small" style={{ marginBottom: 16 }} title={<><FilterOutlined /> Фильтры</>}>
                        <Form form={filterForm} layout="vertical">
                            <Row gutter={16}>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Поиск">
                                        <Input.Search
                                            placeholder="Имя, телефон, авто, № заявки"
                                            allowClear
                                            value={searchText}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearchText(value);
                                                // Дебаунс для поиска через API
                                                clearTimeout((window as any).searchTimeout);
                                                (window as any).searchTimeout = setTimeout(() => {
                                                    if (isManager) {
                                                        fetchRequests(value);
                                                    } else {
                                                        applyFilters();
                                                    }
                                                }, 500);
                                            }}
                                            onSearch={(value) => {
                                                setSearchText(value);
                                                fetchRequests(value);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Статус">
                                        <Select
                                            placeholder="Все статусы"
                                            allowClear
                                            value={statusFilter}
                                            onChange={(value) => {
                                                setStatusFilter(value || null);
                                                handleFilterChange();
                                            }}
                                        >
                                            <Select.Option value="NOVA">Новая</Select.Option>
                                            <Select.Option value="SDELKA">Сделка</Select.Option>
                                            <Select.Option value="OTKLONENO">Отклонено</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Дата создания">
                                        <DatePicker.RangePicker
                                            style={{ width: '100%' }}
                                            value={dateRangeFilter}
                                            onChange={(dates) => {
                                                setDateRangeFilter(dates as any);
                                                handleFilterChange();
                                            }}
                                            format="DD.MM.YYYY"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Ответственный менеджер">
                                        <Select
                                            placeholder="Все"
                                            allowClear
                                            value={managerFilter}
                                            onChange={(value) => {
                                                setManagerFilter(value || null);
                                                handleFilterChange();
                                            }}
                                        >
                                            {Array.from(new Set(requests.map(r => r.manager?.name).filter(Boolean))).map(name => (
                                                <Select.Option key={name as string} value={name as string}>
                                                    {name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Flex justify="space-between" align="center">
                                <Text type="secondary">
                                    Найдено: {filteredRequests.length} из {requests.length}
                                </Text>
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={handleClearFilters}
                                    size="small"
                                >
                                    Сбросить
                                </Button>
                            </Flex>
                        </Form>
                    </Card>
                )}

                {/* Mobile Card List */}
                {isMobile ? (
                    <div>
                        {loading ? (
                            <Card loading={true} />
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(request => (
                                <MobileRequestCard key={request.id} request={request} />
                            ))
                        ) : (
                            <Card>
                                <Text type="secondary">Нет заявок{statusFilter || dateRangeFilter || searchText ? ' по выбранным фильтрам' : ''}</Text>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Desktop/Tablet Table */
                    <Table
                        columns={columns}
                        dataSource={filteredRequests}
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
                            <Select.Option value="NOVA">Новая</Select.Option>
                            <Select.Option value="SDELKA">Сделка</Select.Option>
                            <Select.Option value="OTKLONENO">Отклонено</Select.Option>
                            <Select.Option value="ZAVERSHENA">Завершена</Select.Option>
                        </Select>
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
                        <Input.TextArea rows={4} placeholder="Общий комментарий к заявке" />
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
