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
} from 'antd';
import {
    ArrowLeftOutlined,
    ToolOutlined,
    UserOutlined,
    DollarOutlined,
    CheckOutlined,
    CameraOutlined,
    ClockCircleOutlined,
    EditOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;
const { Option } = Select;

interface WorkOrderExecutor {
    id: number;
    workType: string;
    description: string;
    amount: number;
    isPaid: boolean;
    paidAmount: number;
    metadata?: any;
    executor: { id: number; name: string; email: string };
}

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
    servicesData?: any;
    bodyPartsData?: any;
    executorAssignments?: WorkOrderExecutor[];
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
    const { notification } = App.useApp();
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
        let interval: any;
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

    const partLabels: Record<string, string> = {
        radiatorGrille: 'Решётка радиатора',
        fogLights: 'ПТФ',
        fenders: 'Крылья',
        doorHandles: 'Ручки дверей',
        badges: 'Значки',
        inscriptions: 'Надписи',
        hubCaps: 'Колпачки',
        railings: 'Рейлинги',
    };

    const serviceLabels: Record<string, string> = {
        film: 'Плёнка',
        dryCleaning: 'Химчистка',
        polishing: 'Полировка / Керамика',
        wheelPainting: 'Покраска дисков',
        carbon: 'Карбон',
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
                            {/* NEW: Edit Button - Manager or Master */}
                            {(isManager || (isMaster && workOrder.master?.id === user?.id)) && (
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/work-orders/${id}/edit`)}
                                >
                                    Редактировать
                                </Button>
                            )}

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
                    {/* Executor Salary Section (My Salary) */}
                    {(isExecutor || user?.role === 'ADMIN') && workOrder.executorAssignments && (
                        <Card
                            title={<Space><DollarOutlined /> Моя ЗП по этому заказ-наряду</Space>}
                            style={{ marginBottom: 24, border: '2px solid #52c41a' }}
                            headStyle={{ background: '#f6ffed' }}
                        >
                            {(() => {
                                const myWorks = workOrder.executorAssignments.filter(a => a.executor.id === user?.id || user?.role === 'ADMIN');
                                if (myWorks.length === 0) return <Text type="secondary">Работ не найдено</Text>;

                                const total = myWorks.reduce((sum, w) => sum + w.amount, 0);
                                const paid = myWorks.reduce((sum, w) => sum + w.paidAmount, 0);

                                return (
                                    <>
                                        <div style={{ padding: '0 8px' }}>
                                            {myWorks.map(work => (
                                                <div key={work.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                                                    <div>
                                                        <Text strong>{work.description}</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>{work.workType}</Text>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Text strong style={{ fontSize: '16px' }}>{work.amount.toLocaleString('ru-RU')} ₽</Text>
                                                        {work.isPaid && <Tag color="green" style={{ marginLeft: 8 }}>Выплачено</Tag>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                                            <Title level={4} style={{ margin: 0 }}>Итого к выплате:</Title>
                                            <div style={{ textAlign: 'right' }}>
                                                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>{total.toLocaleString('ru-RU')} ₽</Title>
                                                {paid > 0 && <Text type="secondary">Выплачено: {paid.toLocaleString('ru-RU')} ₽</Text>}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </Card>
                    )}

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

                    {/* Armaturka Section - Includes Fixed Services */}
                    {workOrder.executorAssignments?.some(a => a.workType.startsWith('ARMATURA_') || a.workType.startsWith('FIXED_')) && (
                        <Card title={<Space><ToolOutlined /> Арматурные работы (Антихром)</Space>} style={{ marginBottom: 24 }}>
                            <Row gutter={[16, 16]}>
                                {workOrder.executorAssignments
                                    .filter(a => a.workType.startsWith('ARMATURA_') || a.workType.startsWith('FIXED_'))
                                    .filter(a => !isExecutor || a.executor.id === user?.id)
                                    .map(work => (
                                        <Col xs={24} sm={12} md={6} key={work.id}>
                                            <div style={{ padding: 12, background: '#fafafa', borderRadius: 8, height: '100%' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>{work.description}</Text>
                                                <div style={{ margin: '4px 0' }}>
                                                    <Text strong>{work.executor.name}</Text>
                                                </div>
                                                <Tag color="blue">{work.amount.toLocaleString('ru-RU')} ₽</Tag>
                                            </div>
                                        </Col>
                                    ))}
                            </Row>
                        </Card>
                    )}

                    {/* Body Parts Section */}
                    {Object.keys(workOrder.bodyPartsData || {}).length > 0 && (
                        <Card title={<Space><ToolOutlined /> Детали кузова</Space>} style={{ marginBottom: 24 }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#fafafa' }}>
                                        <tr>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>Деталь</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #f0f0f0' }}>План</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #f0f0f0' }}>Факт</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>Статус</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>Исполнитель</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(workOrder.bodyPartsData).map(([key, data]: [string, any]) => {
                                            const partName = partLabels[key] || key;
                                            const assignment = workOrder.executorAssignments?.find(a =>
                                                a.workType === 'BODY_PART' && (a.description === partName || a.description === key)
                                            );

                                            // Executor sees only their own parts
                                            if (isExecutor && assignment?.executor.id !== user?.id) {
                                                return null;
                                            }

                                            return (
                                                <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <Text strong>{partName}</Text>
                                                        {data.letterCount > 0 && <Text type="secondary"> ({data.letterCount} букв)</Text>}
                                                    </td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{data.quantity}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{data.actualQuantity || 0}</td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <Tag color={data.status === 'assembled' ? 'green' : data.status === 'disassembled' ? 'blue' : 'orange'}>
                                                            {data.status === 'assembled' ? 'Собрано' : data.status === 'disassembled' ? 'Разобрано' : 'Ожидание'}
                                                        </Tag>
                                                    </td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Text strong>{assignment?.executor.name || '—'}</Text>
                                                            {(assignment?.amount || 0) > 0 && <Text type="secondary" style={{ fontSize: 11 }}>{assignment!.amount.toLocaleString('ru-RU')} ₽</Text>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* Additional Services */}
                    {Object.keys(workOrder.servicesData || {}).length > 0 && (
                        <Card title={<Space><ToolOutlined /> Дополнительные и другие услуги</Space>} style={{ marginBottom: 24 }}>
                            {Object.entries(workOrder.servicesData).map(([key, data]: [string, any]) => {
                                // Найти все назначения, относящиеся к этой услуге
                                // Для 'film', 'dryCleaning', 'polishing' это обычно одно.
                                // Для 'wheelPainting' и 'carbon' может быть несколько.
                                const relatedAssignments = (workOrder.executorAssignments as any[])?.filter(a =>
                                    a.serviceType === key.toUpperCase() ||
                                    (a.workType === 'SERVICE' && a.description?.toLowerCase().includes(serviceLabels[key]?.toLowerCase()))
                                ) || [];

                                // Executor sees only their own assignments in this service
                                const filteredAssignments = isExecutor
                                    ? relatedAssignments.filter(a => a.executor.id === user?.id)
                                    : relatedAssignments;

                                // If executor has no assignments in this block, hide the block
                                if (isExecutor && filteredAssignments.length === 0) {
                                    return null;
                                }

                                return (
                                    <div key={key} style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <Title level={5} style={{ margin: 0 }}>{serviceLabels[key] || key}</Title>
                                            {data.comment && <Text type="secondary" style={{ fontSize: 12 }}>“{data.comment}”</Text>}
                                        </div>

                                        {filteredAssignments.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {filteredAssignments.map(a => (
                                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: 4, border: '1px solid #f5f5f5' }}>
                                                        <Space direction="vertical" size={0}>
                                                            <Text strong>{a.executor.name}</Text>
                                                            <Text type="secondary" style={{ fontSize: 11 }}>{a.description}</Text>
                                                        </Space>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <Text strong>{a.amount.toLocaleString('ru-RU')} ₽</Text>
                                                            <br />
                                                            {a.isPaid && <Tag color="green" style={{ margin: 0 }}>Выплачено</Tag>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Text type="secondary">Назначения не найдены</Text>
                                        )}
                                    </div>
                                );
                            })}
                        </Card>
                    )}
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                    {/* Financials */}
                    {/* Financials - Hide for Executors AND Masters (Only Manager/Admin) */}
                    {isManager && (
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
                    )}

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
        </div >
    );
};

export default WorkOrderDetailPage;
