import React, { useEffect, useMemo, useState } from 'react';
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
    Popover,
    Collapse,
    Grid,
    Upload,
    message,
    Image,
    Statistic,
    Radio,
    Checkbox,
    theme,
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
    InfoCircleOutlined,
    UploadOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;
const { Option } = Select;
const { useToken } = theme;

// Photo Report Component
const PhotoReportSection: React.FC<{ workOrderId: number; photos: string[]; onUpdate: () => void }> = ({ workOrderId, photos, onUpdate }) => {
    const { notification } = App.useApp();
    const { token } = useToken();
    const isDarkMode = token.colorBgBase === '#141414' || document.documentElement.getAttribute('data-theme') === 'dark';
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const thumbnailWrapperStyle = {
        width: '100%',
        aspectRatio: '1 / 1',
        position: 'relative' as const,
        overflow: 'hidden',
        borderRadius: 8,
        background: isDarkMode ? token.colorFillQuaternary : '#f5f5f5',
        minHeight: 110, // fallback for browsers without aspect-ratio support
    };
    const imageStyle = {
        width: '100%',
        height: '100%',
        display: 'block',
    };

    useEffect(() => {
        // Initialize file list from existing photos
        setFileList(photos.map((url, index) => ({
            uid: `existing-${index}-${Date.now()}`,
            name: `photo-${index + 1}`,
            status: 'done' as const,
            url: url.startsWith('http') ? url : `${window.location.origin}${url}`,
        })));
    }, [photos]);

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError, onProgress } = options;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/work-orders/${workOrderId}/photos/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    onProgress({ percent });
                },
            });

            onSuccess(response.data);
            notification.success({ title: 'Фото загружено успешно' });
            onUpdate();
        } catch (error: any) {
            onError(error);
            notification.error({ 
                title: 'Ошибка загрузки', 
                description: error.response?.data?.message || 'Не удалось загрузить фото' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (file: UploadFile) => {
        if (file.url) {
            try {
                const photoUrl = file.url.replace(window.location.origin, '');
                await api.delete(`/work-orders/${workOrderId}/photos/${encodeURIComponent(photoUrl)}`);
                notification.success({ title: 'Фото удалено' });
                onUpdate();
            } catch (error) {
                notification.error({ title: 'Ошибка удаления фото' });
            }
        }
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Можно загружать только изображения!');
            return Upload.LIST_IGNORE;
        }

        const isValidFormat = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
        if (!isValidFormat) {
            message.error('Поддерживаются только форматы JPG, PNG и WebP!');
            return Upload.LIST_IGNORE;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Изображение должно быть меньше 5MB!');
            return Upload.LIST_IGNORE;
        }

        return true;
    };

    const imageUrls = fileList
        .filter(file => file.status === 'done' && file.url)
        .map(file => file.url as string);

    return (
        <div>
            <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                    {fileList.map((file, index) => {
                        if (file.status === 'done' && file.url) {
                            return (
                                <Col key={file.uid || index} xs={8} sm={6} md={6}>
                                    <div style={thumbnailWrapperStyle} className="photo-report-thumb">
                                        <Image
                                            src={file.url}
                                            alt={file.name}
                                            style={imageStyle}
                                            preview={{ mask: 'Просмотр' }}
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            size="small"
                                            style={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                border: 'none',
                                                zIndex: 1,
                                            }}
                                            onClick={() => handleRemove(file)}
                                        />
                                    </div>
                                </Col>
                            );
                        }
                        return null;
                    })}
                    {fileList.length < 20 && (
                        <Col xs={8} sm={6} md={6}>
                            <Upload
                                customRequest={handleUpload}
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                            >
                                <div
                                    style={{
                                        ...thumbnailWrapperStyle,
                                        border: `2px dashed ${isDarkMode ? token.colorBorderSecondary : '#d9d9d9'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: isDarkMode ? token.colorFillQuaternary : '#fafafa',
                                    }}
                                >
                                    <UploadOutlined style={{ fontSize: 24, color: '#999' }} />
                                    <Text type="secondary" style={{ marginTop: 8, fontSize: 12 }}>Загрузить</Text>
                                </div>
                            </Upload>
                        </Col>
                    )}
                </Row>
            </Image.PreviewGroup>
        </div>
    );
};

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
    managerId?: number;
    masterId?: number;
    executorId?: number;
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

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

const WorkOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notification } = App.useApp();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md; // < 768px
    const { token } = useToken();
    const isDarkMode = token.colorBgBase === '#141414' || document.documentElement.getAttribute('data-theme') === 'dark';
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [masters, setMasters] = useState<User[]>([]);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [assignType, setAssignType] = useState<'MASTER' | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>('');
    const [taskUpdateId, setTaskUpdateId] = useState<number | null>(null);
    const [finalStage, setFinalStage] = useState<'SENT' | 'ISSUED' | null>(null);
    const myAssignments = useMemo(
        () => (workOrder?.executorAssignments || []).filter(a => a.executor?.id === user?.id),
        [workOrder?.executorAssignments, user?.id]
    );
    const hasStarted = useMemo(
        () => myAssignments.some(a => (a.metadata as any)?.startedAt),
        [myAssignments]
    );
    const [mySeconds, setMySeconds] = useState(0);

    const fetchWorkOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/work-orders/${id}`);
            setWorkOrder(response.data);
        } catch (error) {
            notification.error({ title: 'Ошибка загрузки заказ-наряда' });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (role: 'MASTER') => {
        try {
            // Для получения мастеров нужен полный список пользователей (только для ADMIN/MANAGER)
            const response = await api.get('/users?role=MASTER');
            setMasters(response.data);
        } catch (error) {
            console.error(`Failed to fetch ${role}s:`, error);
            notification.error({
                title: 'Ошибка загрузки',
                description: 'Не удалось загрузить список мастеров'
            });
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
            const endpoint = 'assign-master';
            const payload = { masterId: selectedUserId };
            await api.post(`/work-orders/${id}/${endpoint}`, payload);
            notification.success({ title: 'Назначено успешно' });
            setIsAssignModalVisible(false);
            fetchWorkOrder();
        } catch (error) {
            notification.error({ title: 'Ошибка назначения' });
        }
    };

    const handleWorkflowAction = async (action: string, onSuccess?: () => void) => {
        try {
            await api.post(`/work-orders/${id}/${action}`);
            notification.success({ title: 'Статус обновлен' });
            fetchWorkOrder();
            onSuccess?.();
        } catch (error) {
            notification.error({ title: 'Ошибка обновления статуса' });
        }
    };

    const handleCompleteWithStage = async () => {
        if (!finalStage) {
            notification.warning({ title: 'Выберите финальный этап' });
            return;
        }
        try {
            await api.post(`/work-orders/${id}/complete`, { finalStage });
            notification.success({ title: 'Заказ-наряд завершён' });
            fetchWorkOrder();
        } catch (error: any) {
            notification.error({
                title: 'Ошибка завершения',
                description: error.response?.data?.message || 'Не удалось завершить заказ-наряд',
            });
        }
    };

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const sec = seconds % 60;
        if (hrs > 0) return `${hrs} ч ${mins.toString().padStart(2, '0')} мин`;
        return `${mins} мин ${sec.toString().padStart(2, '0')} с`;
    };

    const calcMySeconds = () => {
        let total = 0;
        const now = new Date();
        myAssignments.forEach(a => {
            const meta: any = a.metadata || {};
            if (!meta.startedAt) return;
            const start = new Date(meta.startedAt);
            const end = meta.finishedAt ? new Date(meta.finishedAt) : now;
            total += Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
        });
        return total;
    };

    useEffect(() => {
        if (!workOrder || !user?.id) {
            setMySeconds(0);
            return;
        }
        const update = () => setMySeconds(calcMySeconds());
        update();
        const hasActive = myAssignments.some(a => {
            const meta: any = a.metadata || {};
            return meta.startedAt && !meta.finishedAt;
        });
        if (!hasActive) return;
        const int = setInterval(update, 1000);
        return () => clearInterval(int);
    }, [workOrder, user?.id, myAssignments]);

    const handleTaskStatusChange = async (assignmentId: number, status: TaskStatus) => {
        try {
            setTaskUpdateId(assignmentId);
            await api.patch(`/work-orders/${id}/tasks/${assignmentId}/status`, { status });
            notification.success({ title: 'Статус задачи обновлен' });
            fetchWorkOrder();
        } catch (error: any) {
            notification.error({
                title: 'Не удалось обновить задачу',
                description: error.response?.data?.message || 'Ошибка',
            });
        } finally {
            setTaskUpdateId(null);
        }
    };

    const openAssignModal = (type: 'MASTER') => {
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
            UNDER_REVIEW: 'На проверке',
            APPROVED: 'Одобрен',
            RETURNED_FOR_REVISION: 'Возврат на доработку',
            ASSEMBLED: 'Собран',
            SENT: 'Отправлен',
            ISSUED: 'Выдан',
            COMPLETED: 'Завершён',
        };
        return texts[status] || status;
    };

    const getTaskStatus = (assignment: any): TaskStatus => {
        return (assignment.metadata?.status as TaskStatus) || 'PENDING';
    };

    const partLabels: Record<string, string> = {
        radiatorGrille: 'Решётка радиатора',
        frontBumper: 'Передний бампер',
        lip: 'Губа',
        hood: 'Капот',
        fogLights: 'ПТФ (противотуманки)',
        fenders: 'Крылья',
        windowMoldings: 'Оконные молдинги',
        vents: 'Форточки',
        doorHandles: 'Ручки дверей',
        doorMoldings: 'Дверные молдинги',
        mirrors: 'Зеркала',
        badges: 'Значки',
        inscriptions: 'Надписи',
        trunkLid: 'Крышка багажника',
        spoiler: 'Спойлер',
        rearBumper: 'Задний бампер',
        diffuser: 'Диффузор',
        rearLights: 'Задние фонари',
        fakeExhausts: 'Фальш насадки',
        sills: 'Пороги',
        hubCaps: 'Колпачки',
        railings: 'Рейлинги',
        wheels: 'Колёса',
        nozzles: 'Насадки',
    };

    const serviceLabels: Record<string, string> = {
        film: 'Плёнка',
        dryCleaning: 'Химчистка',
        polishing: 'Полировка / Керамика',
        wheelPainting: 'Покраска дисков',
        carbon: 'Карбон',
        soundproofing: 'Шумоизоляция',
    };

    // Calculate amount breakdown
    const calculateAmountBreakdown = () => {
        // Safe check for workOrder
        if (!workOrder) {
            return {
                servicesAmount: 0,
                partsAmount: 0,
                discount: 0,
                total: 0,
            };
        }

        let servicesAmount = 0;
        let partsAmount = 0;

        // Use safe defaults for servicesData and bodyPartsData
        const servicesData = workOrder.servicesData ?? {};
        const bodyPartsData = workOrder.bodyPartsData ?? {};

        // Calculate services amount from servicesData
        if (servicesData.film?.amount) servicesAmount += servicesData.film.amount;
        if (servicesData.dryCleaning?.serviceAmount) servicesAmount += servicesData.dryCleaning.serviceAmount;
        if (servicesData.polishing?.serviceAmount) servicesAmount += servicesData.polishing.serviceAmount;
        if (servicesData.wheelPainting?.amount) servicesAmount += servicesData.wheelPainting.amount;
        if (servicesData.carbon?.serviceAmount) servicesAmount += servicesData.carbon.serviceAmount;
        if (servicesData.soundproofing?.amount) servicesAmount += servicesData.soundproofing.amount;

        // Calculate parts amount from bodyPartsData (400 per part)
        Object.values(bodyPartsData).forEach((part: any) => {
            if (part && part.quantity) {
                partsAmount += part.quantity * 400;
            }
        });

        // Calculate discount (if totalAmount is less than sum of services + parts)
        const totalAmount = workOrder.totalAmount ?? 0;
        const subtotal = servicesAmount + partsAmount;
        const discount = subtotal > totalAmount ? subtotal - totalAmount : 0;

        return {
            servicesAmount,
            partsAmount,
            discount,
            total: totalAmount,
        };
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

    // Calculate amount breakdown after workOrder is confirmed to exist
    const amountBreakdown = calculateAmountBreakdown();

    // Collect detailed services list for Popover
    const getServicesList = () => {
        const servicesList: Array<{ name: string; amount: number }> = [];
        const servicesData = workOrder.servicesData ?? {};
        const serviceLabels: Record<string, string> = {
            film: 'Плёнка',
            dryCleaning: 'Химчистка',
            polishing: 'Полировка / Керамика',
            wheelPainting: 'Покраска дисков',
            carbon: 'Карбон',
            soundproofing: 'Шумоизоляция',
        };

        // From servicesData
        Object.entries(servicesData).forEach(([key, data]: [string, any]) => {
            if (key === 'film' && data?.amount) {
                servicesList.push({ name: serviceLabels[key] || key, amount: data.amount });
            } else if (key === 'dryCleaning' && data?.serviceAmount) {
                servicesList.push({ name: serviceLabels[key] || key, amount: data.serviceAmount });
            } else if (key === 'polishing' && data?.serviceAmount) {
                servicesList.push({ name: serviceLabels[key] || key, amount: data.serviceAmount });
            } else if (key === 'wheelPainting' && data?.amount) {
                servicesList.push({ name: serviceLabels[key] || key, amount: data.amount });
            } else if (key === 'carbon' && data?.serviceAmount) {
                servicesList.push({ name: serviceLabels[key] || key, amount: data.serviceAmount });
            } else if (key === 'soundproofing' && data?.amount) {
                servicesList.push({ name: serviceLabels[key] || key, amount: data.amount });
            }
        });

        // From executorAssignments (for additional services)
        if (workOrder.executorAssignments) {
            workOrder.executorAssignments.forEach(assignment => {
                if (assignment.workType === 'ARMATURA_ADDITIONAL' && assignment.amount && assignment.amount > 0) {
                    servicesList.push({ name: assignment.description || 'Дополнительная услуга', amount: assignment.amount });
                }
            });
        }

        return servicesList;
    };

    const servicesList = getServicesList();
    const hasDetailedServices = servicesList.length > 0;

    const amountBreakdownContent = (
        <div style={{ minWidth: 250, maxWidth: 400 }}>
            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                {hasDetailedServices && (
                    <>
                        <div>
                            <Text strong style={{ fontSize: 13 }}>Услуги:</Text>
                            <div style={{ marginTop: 8, maxHeight: 150, overflowY: 'auto' }}>
                                {servicesList.map((service, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>
                                        <Text style={{ fontSize: 12 }}>{service.name}</Text>
                                        <Text strong style={{ fontSize: 12 }}>{service.amount.toLocaleString('ru-RU')} ₽</Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Divider style={{ margin: '8px 0' }} />
                    </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Услуги (итого):</Text>
                    <Text strong>{amountBreakdown.servicesAmount.toLocaleString('ru-RU')} ₽</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Детали/материалы:</Text>
                    <Text strong>{amountBreakdown.partsAmount.toLocaleString('ru-RU')} ₽</Text>
                </div>
                {amountBreakdown.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                        <Text>Скидка:</Text>
                        <Text strong>-{amountBreakdown.discount.toLocaleString('ru-RU')} ₽</Text>
                    </div>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Итого:</Text>
                    <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                        {amountBreakdown.total.toLocaleString('ru-RU')} ₽
                    </Text>
                </div>
            </Space>
        </div>
    );

    const isAdmin = user?.role === 'ADMIN';
    const isManager = isAdmin || user?.role === 'MANAGER';
    const isMaster = user?.role === 'MASTER';
    const isExecutor = user?.role === 'EXECUTOR' || user?.role === 'PAINTER';
    const canViewFinance = isManager || isAdmin;
    const showAmounts = canViewFinance && !isMaster;
    const canShowAmountFor = (executorId?: number | null) =>
        showAmounts || (isExecutor && executorId && executorId === user?.id);

    const getDurationSec = (assignment: any) => {
        const meta: any = assignment.metadata || {};
        if (!meta.startedAt) return 0;
        const start = new Date(meta.startedAt);
        const end = meta.finishedAt ? new Date(meta.finishedAt) : new Date();
        return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
    };

    const renderAmountAndTime = (assignment: any) => {
        if (!assignment) return null;
        const amount = assignment.amount || 0;
        const durationSec = (assignment as any)?.durationSeconds ?? getDurationSec(assignment);
        return (
            <>
                {canShowAmountFor(assignment.executor?.id) && amount > 0 && (
                    <Tag color="blue" style={{ marginTop: 4 }}>{amount.toLocaleString('ru-RU')} ₽</Tag>
                )}
                {durationSec > 0 && (
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                        Время: {formatDuration(durationSec)}
                    </Text>
                )}
            </>
        );
    };
    
    // Мастер может редактировать заказ-наряды, которые ему назначены
    // Проверяем masterId (если есть прямое поле) или master.id (если загружена связь)
    const canMasterEdit = isMaster && workOrder && user?.id && (
        workOrder.masterId === user.id || 
        workOrder.master?.id === user.id
    );

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
                    <Space orientation="vertical" align="end">
                        {elapsedTime && (
                            <Tag icon={<ClockCircleOutlined />} color="processing" style={{ fontSize: 16, padding: '6px 12px' }}>
                                {workOrder.status === 'COMPLETED' ? 'Общее время: ' : 'В работе: '}
                                {elapsedTime}
                            </Tag>
                        )}
                        <Space>
                            {/* NEW: Edit Button - Manager or Master */}
                            {(isManager || canMasterEdit) && (
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
                            {/* Executor Actions */}
                            {(isExecutor || isAdmin) && (workOrder.status === 'ASSIGNED_TO_EXECUTOR' || workOrder.status === 'RETURNED_FOR_REVISION') && (
                                <Button type="primary" onClick={() => handleWorkflowAction('start', () => setTimeout(fetchWorkOrder, 200))}>Начать работу</Button>
                            )}
                        </Space>
                    </Space>
                </div>

                <Divider />

                <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                    <Descriptions.Item label="Менеджер">{workOrder.manager?.name || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Мастер">{workOrder.master?.name || '—'}</Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Financials Block - Moved right after header */}
            {isManager && (
                <Card title={<Space><DollarOutlined /> Финансы</Space>} style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 14 }}>Общая сумма</Text>
                                    <Popover content={amountBreakdownContent} title="Состав суммы" trigger="hover">
                                        <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer', marginLeft: 8, fontSize: 16 }} />
                                    </Popover>
                                </div>
                                <Statistic
                                    value={workOrder.totalAmount || 0}
                                    precision={0}
                                    styles={{ content: { color: '#52c41a', fontSize: 24 } }}
                                    suffix="₽"
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ padding: '12px 16px', background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%', minHeight: 80 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Способ оплаты</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Tag color="green" style={{ fontSize: 14 }}>
                                        {workOrder.paymentMethod === 'CASH' ? 'Наличные' :
                                            workOrder.paymentMethod === 'NON_CASH' ? 'Безналичные' : 'Без НДС'}
                                    </Tag>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ padding: '12px 16px', background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%', minHeight: 80 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Статус оплаты</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Tag color={workOrder.status === 'COMPLETED' ? 'green' : 'orange'} style={{ fontSize: 14 }}>
                                        {workOrder.status === 'COMPLETED' ? 'Оплачено' : 'В процессе'}
                                    </Tag>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            {(workOrder.status === 'ASSIGNED_TO_MASTER') && (isMaster || isManager || isAdmin) && (
                <Card
                    title="Завершение заказ-наряда"
                    style={{ marginBottom: 24, border: '1px solid #e6f7ff' }}
                    styles={{ header: { background: '#e6f7ff' } }}
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Text strong>Выберите финальный этап:</Text>
                            <br />
                            <Radio.Group
                                value={finalStage}
                                onChange={(e) => setFinalStage(e.target.value)}
                                style={{ marginTop: 8 }}
                            >
                                <Radio.Button value="SENT">Отправлен</Radio.Button>
                                <Radio.Button value="ISSUED">Выдан</Radio.Button>
                            </Radio.Group>
                        </div>
                        <Button type="primary" onClick={handleCompleteWithStage} disabled={!finalStage}>
                            Завершить заказ-наряд
                        </Button>
                    </Space>
                </Card>
            )}

            <Row gutter={[24, 24]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
            {/* Executor Salary Section (no display for Master) */}
            {workOrder.executorAssignments && workOrder.executorAssignments.length > 0 && (isExecutor || isManager) && (
                        <>
                            {isExecutor && (
                                <Card
                                    title="Моё время по заказ-наряду"
                                    style={{ marginBottom: 16, border: '1px solid #e6f7ff' }}
                                    styles={{ header: { background: '#e6f7ff' } }}
                                >
                                    {hasStarted ? (
                                        <Text strong>{mySeconds > 0 ? formatDuration(mySeconds) : 'В работе...'}</Text>
                                    ) : (
                                        <Text type="secondary">Работа ещё не начата</Text>
                                    )}
                                </Card>
                            )}

                            {/* For EXECUTOR: Show only their own salary */}
                            {isExecutor && (
                                <Card
                                    title={<Space><DollarOutlined /> Моя ЗП по этому заказ-наряду</Space>}
                                    style={{ marginBottom: 24, border: '2px solid #52c41a' }}
                                    styles={{ header: { background: '#f6ffed' } }}
                                >
                                    {(() => {
                                        const myWorks = workOrder.executorAssignments?.filter(a => a.executor?.id === user?.id) || [];
                                        if (myWorks.length === 0) return <Text type="secondary">Работ не найдено</Text>;

                                        const total = myWorks.reduce((sum, w) => sum + w.amount, 0);
                                        const paid = myWorks.reduce((sum, w) => sum + w.paidAmount, 0);

                                        return (
                                            <>
                                                <div style={{ padding: '0 8px' }}>
                                                    {myWorks.map(work => (
                                                        <div key={work.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>
                                                            <div>
                                                                <Text strong>{work.description || '—'}</Text>
                                                                <br />
                                                                <Text type="secondary" style={{ fontSize: '12px' }}>{work.workType || '—'}</Text>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <Text strong style={{ fontSize: '16px' }}>{(work.amount || 0).toLocaleString('ru-RU')} ₽</Text>
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

                            {/* For ADMIN/MANAGER: Show all executors grouped */}
                            {isManager && (
                                <Card
                                    title={<Space><DollarOutlined /> Заработная плата исполнителей</Space>}
                                    style={{ marginBottom: 24 }}
                                >
                                    {(() => {
                                        // Group assignments by executor
                                        const groupedByExecutor: Record<number, WorkOrderExecutor[]> = {};
                                        workOrder.executorAssignments?.forEach(assignment => {
                                            if (assignment.executor?.id) {
                                                if (!groupedByExecutor[assignment.executor.id]) {
                                                    groupedByExecutor[assignment.executor.id] = [];
                                                }
                                                groupedByExecutor[assignment.executor.id].push(assignment);
                                            }
                                        });

                                        const collapseItems = Object.entries(groupedByExecutor).map(([executorId, assignments]) => {
                                            const executor = assignments[0]?.executor;
                                            const total = assignments.reduce((sum, w) => sum + (w.amount || 0), 0);
                                            const paid = assignments.reduce((sum, w) => sum + (w.paidAmount || 0), 0);

                                            return {
                                                key: executorId,
                                                label: (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                        <Text strong>{executor?.name || 'Не указан'}</Text>
                                                        <Space>
                                                            <Text type="secondary">Работ: {assignments.length}</Text>
                                                            <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                                                {total.toLocaleString('ru-RU')} ₽
                                                            </Text>
                                                        </Space>
                                                    </div>
                                                ),
                                                children: (
                                                    <div>
                                                        {assignments.map(work => (
                                                            <div key={work.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>
                                                                <div>
                                                                    <Text strong>{work.description || '—'}</Text>
                                                                    <br />
                                                                    <Text type="secondary" style={{ fontSize: '12px' }}>{work.workType || '—'}</Text>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <Text strong style={{ fontSize: '16px' }}>{(work.amount || 0).toLocaleString('ru-RU')} ₽</Text>
                                                                    {work.isPaid && <Tag color="green" style={{ marginLeft: 8 }}>Выплачено</Tag>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Divider style={{ margin: '12px 0' }} />
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text strong>Итого к выплате:</Text>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{total.toLocaleString('ru-RU')} ₽</Text>
                                                                {paid > 0 && (
                                                                    <div>
                                                                        <Text type="secondary" style={{ fontSize: 12 }}>Выплачено: {paid.toLocaleString('ru-RU')} ₽</Text>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            };
                                        });

                                        return <Collapse items={collapseItems} />;
                                    })()}
                                </Card>
                            )}
                        </>
                    )}

                    {/* Tasks for executor and master */}
                    {isExecutor && (
                        <Card
                            title="Мои задачи"
                            style={{ marginBottom: 24, border: '1px solid #e6f7ff' }}
                            styles={{ header: { background: '#e6f7ff' } }}
                        >
                            {workOrder?.executorAssignments?.length === 0 && <Text type="secondary">Задач нет</Text>}
                            {(workOrder?.executorAssignments || []).map(a => {
                                const status = getTaskStatus(a);
                                const isDone = status === 'DONE';
                                return (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>
                                        <div>
                                            <Text strong>{a.description || a.workType}</Text>
                                            <br />
                                            <Tag color={status === 'DONE' ? 'green' : status === 'IN_PROGRESS' ? 'gold' : 'default'}>
                                                {status === 'DONE' ? 'Готово' : status === 'IN_PROGRESS' ? 'В работе' : 'В ожидании'}
                                            </Tag>
                                        </div>
                                        <Button
                                            type={isDone ? 'default' : 'primary'}
                                            onClick={() => handleTaskStatusChange(a.id, 'DONE')}
                                            disabled={isDone || !hasStarted}
                                            loading={taskUpdateId === a.id}
                                        >
                                            {isDone ? 'Выполнено' : 'Отметить выполненным'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </Card>
                    )}

                    {isMaster && (
                        <Card
                            title="Задачи исполнителей"
                            style={{ marginBottom: 24 }}
                        >
                            {(workOrder?.executorAssignments || []).length === 0 && <Text type="secondary">Задач нет</Text>}
                            {(() => {
                                const groups: Record<number, any[]> = {};
                                (workOrder?.executorAssignments || []).forEach(a => {
                                    const key = a.executorId || -1;
                                    if (!groups[key]) groups[key] = [];
                                    groups[key].push(a);
                                });
                                return Object.entries(groups).map(([executorId, tasks]) => {
                                    const name = tasks[0]?.executor?.name || 'Исполнитель не указан';
                                    const totalSec = tasks.reduce((sum: number, t: any) => sum + getDurationSec(t), 0);
                                    return (
                                        <div key={executorId} style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <Text strong>{name}</Text>
                                                {totalSec > 0 && (
                                                    <Text type="secondary">Итого по исполнителю: {formatDuration(totalSec)}</Text>
                                                )}
                                            </div>
                                            {tasks.map((a: any) => {
                                                const status = getTaskStatus(a);
                                                const taskSec = getDurationSec(a);
                                                return (
                                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f5f5f5'}` }}>
                                                        <div>
                                                            <Text strong>{a.description || a.workType}</Text>
                                                            <br />
                                                            {taskSec > 0 && (
                                                                <Text type="secondary" style={{ fontSize: 12 }}>Время: {formatDuration(taskSec)}</Text>
                                                            )}
                                                        </div>
                                                        <Tag color={status === 'DONE' ? 'green' : status === 'IN_PROGRESS' ? 'gold' : 'default'}>
                                                            {status === 'DONE' ? 'Готово' : status === 'IN_PROGRESS' ? 'В работе' : 'В ожидании'}
                                                        </Tag>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                });
                            })()}
                        </Card>
                    )}

                    {/* Customer & Car */}
                    <Card title={<Space><UserOutlined /> Информация о клиенте и авто</Space>} style={{ marginBottom: 24 }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ padding: '12px 16px', background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%', minHeight: 80 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>ФИО заказчика</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong style={{ fontSize: 16 }}>{workOrder.customerName}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ padding: '12px 16px', background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%', minHeight: 80 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Телефон</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong style={{ fontSize: 16 }}>{workOrder.customerPhone}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ padding: '12px 16px', background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%', minHeight: 80 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Марка и модель</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong style={{ fontSize: 16 }}>{workOrder.carBrand} {workOrder.carModel}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ padding: '12px 16px', background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%', minHeight: 80 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>VIN</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong style={{ fontSize: 16 }}>{workOrder.vin || '—'}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ padding: '12px 16px', background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%', minHeight: 80 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Состояние</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color={workOrder.carCondition === 'NEW' ? 'green' : 'default'} style={{ fontSize: 14 }}>
                                            {workOrder.carCondition === 'NEW' ? 'Новая' : 'С пробегом'}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Armaturka Section - Includes Fixed Services (Exclude Additional) */}
                    {workOrder.executorAssignments?.some(a => (a.workType?.startsWith('ARMATURA_') && a.workType !== 'ARMATURA_ADDITIONAL') || a.workType?.startsWith('FIXED_')) && (
                        <Card title={<Space><ToolOutlined /> Арматурные работы (Антихром)</Space>} style={{ marginBottom: 24 }}>
                            <Row gutter={[16, 16]}>
                                {(workOrder.executorAssignments || [])
                                    .filter(a => (a.workType?.startsWith('ARMATURA_') && a.workType !== 'ARMATURA_ADDITIONAL') || a.workType?.startsWith('FIXED_'))
                                    .filter(a => !isExecutor || a.executor?.id === user?.id)
                                    .map(work => (
                                        <Col xs={24} sm={12} md={6} key={work.id}>
                                            <div style={{ padding: 12, background: isDarkMode ? token.colorFillQuaternary : '#fafafa', borderRadius: 8, height: '100%' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>{work.description || '—'}</Text>
                                                <div style={{ margin: '4px 0' }}>
                                                    <Text strong>{work.executor?.name || 'Не указан'}</Text>
                                                </div>
                                                {renderAmountAndTime(work)}
                                            </div>
                                        </Col>
                                    ))}
                            </Row>
                        </Card>
                    )}

                    {/* Body Parts Section */}
                    {Object.keys(workOrder.bodyPartsData || {}).length > 0 && (
                        <Card title={<Space><ToolOutlined /> Детали кузова</Space>} style={{ marginBottom: 24 }}>
                            {/* Desktop/Tablet: Table Layout */}
                            <div style={{ display: isMobile ? 'none' : 'block' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: isDarkMode ? token.colorFillQuaternary : '#fafafa' }}>
                                            <tr>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `2px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>Деталь</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: `2px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>Кол-во / План-Факт</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `2px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>Статус</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `2px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>Исполнитель</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(workOrder.bodyPartsData || {}).map(([key, data]: [string, any]) => {
                                                const partName = partLabels[key] || key;
                                                const assignment = workOrder.executorAssignments?.find(a =>
                                                    a.workType === 'BODY_PART' && (a.description === partName || a.description === key)
                                                );

                                                const executorId = assignment?.executor.id || data.executorId;
                                                const executorName = assignment?.executor?.name || '—';

                                                // Executor sees only their own parts
                                                if (isExecutor && executorId !== user?.id) {
                                                    return null;
                                                }

                                                // Logic for quantity display
                                                const hasActual = data.actualQuantity !== undefined && data.actualQuantity !== null;
                                                const quantityDisplay = hasActual
                                                    ? `План: ${data.quantity} / Факт: ${data.actualQuantity}`
                                                    : `Кол-во: ${data.quantity}`;

                                                return (
                                                    <tr key={key} style={{ borderBottom: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}` }}>
                                                        <td style={{ padding: '12px 8px' }}>
                                                            <Text strong>{partName}</Text>
                                                            {data.letterCount > 0 && <Text type="secondary"> ({data.letterCount} букв)</Text>}
                                                        </td>
                                                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                            {quantityDisplay}
                                                        </td>
                                                        <td style={{ padding: '12px 8px' }}>
                                                            <Tag color={data.status === 'assembled' ? 'green' : data.status === 'disassembled' ? 'blue' : 'orange'}>
                                                                {data.status === 'assembled' ? 'Собрано' : data.status === 'disassembled' ? 'Разобрано' : 'Ожидание'}
                                                            </Tag>
                                                        </td>
                                                        <td style={{ padding: '12px 8px' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Text strong>{executorName}</Text>
                                                            {renderAmountAndTime(assignment)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile: Card Layout */}
                            <div style={{ display: isMobile ? 'block' : 'none' }}>
                                <Row gutter={[12, 12]}>
                                    {Object.entries(workOrder.bodyPartsData || {}).map(([key, data]: [string, any]) => {
                                        const partName = partLabels[key] || key;
                                        const assignment = workOrder.executorAssignments?.find(a =>
                                            a.workType === 'BODY_PART' && (a.description === partName || a.description === key)
                                        );

                                        const executorId = assignment?.executor.id || data.executorId;
                                        const executorName = assignment?.executor?.name || '—';

                                        // Executor sees only their own parts
                                        if (isExecutor && executorId !== user?.id) {
                                            return null;
                                        }

                                        const hasActual = data.actualQuantity !== undefined && data.actualQuantity !== null;
                                        const quantityDisplay = hasActual
                                            ? `План: ${data.quantity} / Факт: ${data.actualQuantity}`
                                            : `Кол-во: ${data.quantity}`;

                                        return (
                                            <Col xs={24} key={key}>
                                                <Card size="small" style={{ marginBottom: 8 }}>
                                                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                                        <div>
                                                            <Text strong style={{ fontSize: 14 }}>{partName}</Text>
                                                            {data.letterCount > 0 && <Text type="secondary" style={{ fontSize: 12 }}> ({data.letterCount} букв)</Text>}
                                                        </div>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>Количество: </Text>
                                                            <Text>{quantityDisplay}</Text>
                                                        </div>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>Статус: </Text>
                                                            <Tag color={data.status === 'assembled' ? 'green' : data.status === 'disassembled' ? 'blue' : 'orange'}>
                                                                {data.status === 'assembled' ? 'Собрано' : data.status === 'disassembled' ? 'Разобрано' : 'Ожидание'}
                                                            </Tag>
                                                        </div>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>Исполнитель: </Text>
                                                            <Text strong>{executorName}</Text>
                                                            {renderAmountAndTime(assignment)}
                                                        </div>
                                                    </Space>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>
                        </Card>
                    )}

                    {/* Additional and Other Services */}
                    {(Object.keys(workOrder.servicesData || {}).length > 0 || workOrder.executorAssignments?.some(a => a.workType === 'ARMATURA_ADDITIONAL')) && (
                        <Card title={<Space><ToolOutlined /> Дополнительные и другие услуги</Space>} style={{ marginBottom: 24 }}>

                            {/* 1. ARMATURA_ADDITIONAL (Additional Services from Form) */}
                            {workOrder.executorAssignments?.filter(a => a.workType === 'ARMATURA_ADDITIONAL').map(a => {
                                if (isExecutor && a.executor?.id !== user?.id) return null;
                                return (
                                    <div key={a.id} style={{ marginBottom: 16, padding: 16, border: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}`, borderRadius: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <Title level={5} style={{ margin: 0 }}>{a.description || 'Дополнительная услуга'}</Title>
                                            <Tag color="cyan">Дополнительная услуга</Tag>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDarkMode ? token.colorBgContainer : '#fff', padding: '8px 12px', borderRadius: 4, border: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f5f5f5'}` }}>
                                            <Space orientation="vertical" size={0}>
                                                <Text strong>{a.executor?.name || 'Не указан'}</Text>
                                            </Space>
                                            <div style={{ textAlign: 'right' }}>
                                                {canShowAmountFor(a.executor?.id) && (a.amount || 0) > 0 && (
                                                    <>
                                                        <Text strong>{(a.amount || 0).toLocaleString('ru-RU')} ₽</Text><br />
                                                        {a.isPaid && <Tag color="green" style={{ margin: 0 }}>Выплачено</Tag>}
                                                    </>
                                                )}
                                                {getDurationSec(a) > 0 && (
                                                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                                        {formatDuration(getDurationSec(a))}
                                                    </Text>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}


                            {/* 2. Standard Services from servicesData */}
                            {Object.entries(workOrder.servicesData || {}).map(([key, data]: [string, any]) => {
                                // Найти все назначения, относящиеся к этой услуге
                                const relatedAssignments = (workOrder.executorAssignments as any[])?.filter(a => {
                                    const upperKey = key.toUpperCase();
                                    const snakeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
                                    return a.serviceType === upperKey ||
                                        a.serviceType === snakeKey ||
                                        a.workType === `SERVICE_${upperKey}` ||
                                        a.workType === `SERVICE_${snakeKey}` ||
                                        (a.description?.toLowerCase().includes(serviceLabels[key]?.toLowerCase()));
                                }) || [];

                                // Executor sees only their own assignments in this service
                                const filteredAssignments = isExecutor
                                    ? relatedAssignments.filter(a => a.executor?.id === user?.id)
                                    : relatedAssignments;

                                // If executor has no assignments in this block, hide the block
                                if (isExecutor && filteredAssignments.length === 0) {
                                    return null;
                                }

                                return (
                                    <div key={key} style={{ marginBottom: 16, padding: 16, border: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}`, borderRadius: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <Title level={5} style={{ margin: 0 }}>{serviceLabels[key] || key}</Title>
                                            {data.comment && <Text type="secondary" style={{ fontSize: 12 }}>“{data.comment}”</Text>}
                                        </div>

                                        {filteredAssignments.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {filteredAssignments.map(a => (
                                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDarkMode ? token.colorBgContainer : '#fff', padding: '8px 12px', borderRadius: 4, border: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f5f5f5'}` }}>
                                                        <Space orientation="vertical" size={0}>
                                                            <Text strong>{a.executor?.name || 'Не указан'}</Text>
                                                            <Text type="secondary" style={{ fontSize: 11 }}>{a.description || '—'}</Text>
                                                        </Space>
                                                        <div style={{ textAlign: 'right' }}>
                                                            {canShowAmountFor(a.executor?.id) && (a.amount || 0) > 0 && (
                                                                <>
                                                                    <Text strong>{(a.amount || 0).toLocaleString('ru-RU')} ₽</Text><br />
                                                                    {a.isPaid && <Tag color="green" style={{ margin: 0 }}>Выплачено</Tag>}
                                                                </>
                                                            )}
                                                            {getDurationSec(a) > 0 && (
                                                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                                                    {formatDuration(getDurationSec(a))}
                                                                </Text>
                                                            )}
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
                    {/* Photos Section */}
                    <Card title={<Space><CameraOutlined /> Фотоотчет</Space>}>
                        <PhotoReportSection workOrderId={workOrder.id} photos={workOrder.photosAfterWork || []} onUpdate={fetchWorkOrder} />
                    </Card>
                </Col>
            </Row>

            {/* Assign Modal */}
            <Modal
                title="Назначить мастера"
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
                    {(masters || []).map(u => (
                        <Option key={u.id} value={u.id}>{u.name}</Option>
                    ))}
                </Select>
            </Modal>
        </div >
    );
};

export default WorkOrderDetailPage;
