import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Descriptions,
    Button,
    Tag,
    Space,
    App,
    Spin,
    Divider,
    Row,
    Col,
    Typography,
    Select,
    Modal,
    Upload,
    Image,
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckOutlined,
    CloseOutlined,
    UserOutlined,
    CarOutlined,
    ToolOutlined,
    DollarOutlined,
    CameraOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;
const { Option } = Select;

interface WorkOrder {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    paymentMethod: string;
    customerName: string;
    customerPhone: string;
    carBrand: string;
    carModel: string;
    vin?: string;
    carCondition: string;
    blackCount: number;
    carbonCount: number;
    standardStructureCount: number;
    dismantling: boolean;
    dismantlingPrice: number;
    disassembly: boolean;
    disassemblyPrice: number;
    assembly: boolean;
    assemblyPrice: number;
    mounting: boolean;
    mountingPrice: number;
    radiatorGrille: boolean;
    fogLights: boolean;
    frontBumper: boolean;
    lip: boolean;
    hood: boolean;
    windowMoldings: boolean;
    doorMoldings: boolean;
    vents: boolean;
    fenders: boolean;
    doorHandles: boolean;
    mirrors: boolean;
    trunkLid: boolean;
    spoiler: boolean;
    rearBumper: boolean;
    diffuser: boolean;
    rearLights: boolean;
    fakeExhausts: boolean;
    badges: boolean;
    inscriptions: boolean;
    hubCaps: boolean;
    railings: boolean;
    sills: boolean;
    wheels: boolean;
    nozzles: boolean;
    photosBeforeWork: string[];
    photosAfterWork: string[];
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    requestId?: number;
    manager?: { id: number; name: string; email: string };
    master?: { id: number; name: string; email: string };
    executor?: { id: number; name: string; email: string };
}

interface User {
    id: number;
    name: string;
    role: string;
}

const WorkOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notification, modal } = App.useApp();
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [masters, setMasters] = useState<User[]>([]);
    const [executors, setExecutors] = useState<User[]>([]);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [assignType, setAssignType] = useState<'MASTER' | 'EXECUTOR' | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>('');

    const fetchWorkOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/work-orders/${id}`);
            setWorkOrder(response.data);
        } catch (error) {
            notification.error({ title: 'Ошибка загрузки заказ-наряда' });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (role: 'MASTER' | 'EXECUTOR') => {
        try {
            const response = await axios.get(`http://localhost:3000/api/users?role=${role}`);
            if (role === 'MASTER') setMasters(response.data);
            else setExecutors(response.data);
        } catch (error) {
            console.error(`Failed to fetch ${role}s:`, error);
        }
    };

    useEffect(() => {
        fetchWorkOrder();
    }, [id]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (workOrder?.status === 'IN_PROGRESS' && workOrder.startedAt) {
            const updateTimer = () => {
                const start = dayjs(workOrder.startedAt);
                const now = dayjs();
                const diff = dayjs.duration(now.diff(start));
                const hours = Math.floor(diff.asHours());
                const minutes = diff.minutes();
                setElapsedTime(`${hours}ч ${minutes}м`);
            };
            updateTimer();
            interval = setInterval(updateTimer, 60000); // Update every minute
        } else if (workOrder?.status === 'COMPLETED' && workOrder.startedAt && workOrder.completedAt) {
            const start = dayjs(workOrder.startedAt);
            const end = dayjs(workOrder.completedAt);
            const diff = dayjs.duration(end.diff(start));
            const hours = Math.floor(diff.asHours());
            const minutes = diff.minutes();
            setElapsedTime(`${hours}ч ${minutes}м`);
        } else {
            setElapsedTime('');
        }
        return () => clearInterval(interval);
    }, [workOrder]);

    const handleAssign = async () => {
        if (!selectedUserId || !assignType) return;
        try {
            const endpoint = assignType === 'MASTER' ? 'assign-master' : 'assign-executor';
            const payload = assignType === 'MASTER' ? { masterId: selectedUserId } : { executorId: selectedUserId };
            await axios.post(`http://localhost:3000/api/work-orders/${id}/${endpoint}`, payload);
            notification.success({ title: 'Назначено успешно' });
            setIsAssignModalVisible(false);
            fetchWorkOrder();
        } catch (error) {
            notification.error({ title: 'Ошибка назначения' });
        }
    };

    const handleWorkflowAction = async (action: string) => {
        try {
            await axios.post(`http://localhost:3000/api/work-orders/${id}/${action}`);
            notification.success({ title: 'Статус обновлен' });
            fetchWorkOrder();
        } catch (error) {
            notification.error({ title: 'Ошибка обновления статуса' });
        }
    };

    const openAssignModal = (type: 'MASTER' | 'EXECUTOR') => {
        setAssignType(type);
        fetchUsers(type);
        setIsAssignModalVisible(true);
        setSelectedUserId(null);
    };

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

    const renderPart = (label: string, value: boolean) => {
        if (!value) return null;
        return <Tag color="blue">{label}</Tag>;
    };

    const renderArmouring = (label: string, flag: boolean, price: number) => {
        if (!flag && price === 0) return null;
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>{label}</Text>
                <Text strong>{price.toLocaleString('ru-RU')} ₽</Text>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!workOrder) {
        return <div>Заказ-наряд не найден</div>;
    }

    const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
    const isMaster = user?.role === 'ADMIN' || user?.role === 'MASTER';
    const isExecutor = user?.role === 'ADMIN' || user?.role === 'EXECUTOR';

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/work-orders')}
                style={{ marginBottom: 16 }}
            >
                Назад к списку
            </Button>

            {/* Header Card */}
            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>{workOrder.orderNumber}</Title>
                        <Space style={{ marginTop: 8 }}>
                            <Tag color={getStatusColor(workOrder.status)} style={{ fontSize: 14, padding: '4px 10px' }}>
                                {getStatusText(workOrder.status)}
                            </Tag>
                            {workOrder.requestId && (
                                <Button type="link" onClick={() => navigate(`/requests/${workOrder.requestId}`)}>
                                    Перейти к заявке
                                </Button>
                            )}
                        </Space>
                    </div>
                    <Space direction="vertical" align="end">
                        {elapsedTime && (
                            <Tag icon={<ClockCircleOutlined />} color="processing" style={{ fontSize: 16, padding: '6px 12px' }}>
                                {workOrder.status === 'COMPLETED' ? 'Общее время: ' : 'В работе: '}
                                {elapsedTime}
                            </Tag>
                        )}
                        <Space>
                            {/* Manager Actions */}
                            {isManager && workOrder.status === 'NEW' && (
                                <Button type="primary" onClick={() => openAssignModal('MASTER')}>Назначить мастера</Button>
                            )}
                            {isManager && workOrder.status === 'APPROVED' && (
                                <Button type="primary" icon={<CheckOutlined />} onClick={() => handleWorkflowAction('complete')}>Завершить заказ</Button>
                            )}

                            {/* Master Actions */}
                            {isMaster && workOrder.status === 'ASSIGNED_TO_MASTER' && (
                                <Button type="primary" onClick={() => openAssignModal('EXECUTOR')}>Назначить исполнителя</Button>
                            )}
                            {isMaster && workOrder.status === 'UNDER_REVIEW' && (
                                <>
                                    <Button danger onClick={() => handleWorkflowAction('request-revision')}>На доработку</Button>
                                    <Button type="primary" icon={<CheckOutlined />} onClick={() => handleWorkflowAction('approve')}>Принять работу</Button>
                                </>
                            )}

                            {/* Executor Actions */}
                            {isExecutor && (workOrder.status === 'ASSIGNED_TO_EXECUTOR' || workOrder.status === 'RETURNED_FOR_REVISION') && (
                                <Button type="primary" onClick={() => handleWorkflowAction('start')}>Начать работу</Button>
                            )}
                            {isExecutor && workOrder.status === 'IN_PROGRESS' && (
                                <Button type="primary" onClick={() => handleWorkflowAction('submit-review')}>Отправить на проверку</Button>
                            )}
                        </Space>
                    </Space>
                </div>

                <Divider />

                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                    <Descriptions.Item label="Менеджер">{workOrder.manager?.name || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Мастер">{workOrder.master?.name || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Исполнитель">{workOrder.executor?.name || '—'}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Row gutter={[24, 24]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                    {/* Customer & Car */}
                    <Card title={<Space><UserOutlined /> Информация о клиенте и авто</Space>} style={{ marginBottom: 24 }}>
                        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Заказчик">{workOrder.customerName}</Descriptions.Item>
                            <Descriptions.Item label="Телефон">{workOrder.customerPhone}</Descriptions.Item>
                            <Descriptions.Item label="Автомобиль">{workOrder.carBrand} {workOrder.carModel}</Descriptions.Item>
                            <Descriptions.Item label="VIN">{workOrder.vin || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Состояние">{workOrder.carCondition === 'NEW' ? 'Новая' : 'С пробегом'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Parts Details */}
                    <Card title={<Space><ToolOutlined /> Детализация работ</Space>} style={{ marginBottom: 24 }}>
                        {/* Counts */}
                        <Descriptions title="Количество деталей" bordered size="small" style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="Блэк">{workOrder.blackCount}</Descriptions.Item>
                            <Descriptions.Item label="Карбон">{workOrder.carbonCount}</Descriptions.Item>
                            <Descriptions.Item label="Штатная структура">{workOrder.standardStructureCount}</Descriptions.Item>
                        </Descriptions>

                        {/* Armouring */}
                        <div style={{ marginBottom: 24 }}>
                            <Text strong style={{ display: 'block', marginBottom: 12 }}>Арматурные работы</Text>
                            <Row gutter={24}>
                                <Col span={6}>{renderArmouring('Демонтаж', workOrder.dismantling, workOrder.dismantlingPrice)}</Col>
                                <Col span={6}>{renderArmouring('Разборка', workOrder.disassembly, workOrder.disassemblyPrice)}</Col>
                                <Col span={6}>{renderArmouring('Сборка', workOrder.assembly, workOrder.assemblyPrice)}</Col>
                                <Col span={6}>{renderArmouring('Монтаж', workOrder.mounting, workOrder.mountingPrice)}</Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* Specific Parts */}
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Text strong>Передняя часть: </Text>
                                <Space wrap>
                                    {renderPart('Решетка радиатора', workOrder.radiatorGrille)}
                                    {renderPart('ПТФ', workOrder.fogLights)}
                                    {renderPart('Бампер', workOrder.frontBumper)}
                                    {renderPart('Губа', workOrder.lip)}
                                    {renderPart('Капот', workOrder.hood)}
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Text strong>Боковая часть: </Text>
                                <Space wrap>
                                    {renderPart('Молдинги окон', workOrder.windowMoldings)}
                                    {renderPart('Молдинги дверей', workOrder.doorMoldings)}
                                    {renderPart('Форточки', workOrder.vents)}
                                    {renderPart('Крылья', workOrder.fenders)}
                                    {renderPart('Ручки', workOrder.doorHandles)}
                                    {renderPart('Зеркала', workOrder.mirrors)}
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Text strong>Задняя часть: </Text>
                                <Space wrap>
                                    {renderPart('Крышка багажника', workOrder.trunkLid)}
                                    {renderPart('Спойлер', workOrder.spoiler)}
                                    {renderPart('Бампер', workOrder.rearBumper)}
                                    {renderPart('Диффузор', workOrder.diffuser)}
                                    {renderPart('Фонари', workOrder.rearLights)}
                                    {renderPart('Насадки', workOrder.fakeExhausts)}
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Text strong>Другое: </Text>
                                <Space wrap>
                                    {renderPart('Значки', workOrder.badges)}
                                    {renderPart('Надписи', workOrder.inscriptions)}
                                    {renderPart('Колпачки', workOrder.hubCaps)}
                                    {renderPart('Рейлинги', workOrder.railings)}
                                    {renderPart('Пороги', workOrder.sills)}
                                    {renderPart('Колеса', workOrder.wheels)}
                                    {renderPart('Насадки', workOrder.nozzles)}
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                    {/* Financials */}
                    <Card title={<Space><DollarOutlined /> Финансы</Space>} style={{ marginBottom: 24 }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text type="secondary">Общая сумма</Text>
                            <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                                {workOrder.totalAmount.toLocaleString('ru-RU')} ₽
                            </Title>
                        </div>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Оплата">
                                {workOrder.paymentMethod === 'CASH' ? 'Наличные' :
                                    workOrder.paymentMethod === 'NON_CASH' ? 'Безналичные' : 'Без НДС'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Photos Placeholder */}
                    <Card title={<Space><CameraOutlined /> Фотоотчет</Space>}>
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                            <Text>Функционал загрузки фото в разработке</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Assign Modal */}
            <Modal
                title={`Назначить ${assignType === 'MASTER' ? 'мастера' : 'исполнителя'}`}
                open={isAssignModalVisible}
                onOk={handleAssign}
                onCancel={() => setIsAssignModalVisible(false)}
                okText="Назначить"
                cancelText="Отмена"
            >
                <Select
                    style={{ width: '100%' }}
                    placeholder="Выберите сотрудника"
                    onChange={setSelectedUserId}
                    value={selectedUserId}
                >
                    {(assignType === 'MASTER' ? masters : executors).map(u => (
                        <Option key={u.id} value={u.id}>{u.name}</Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
};

export default WorkOrderDetailPage;
