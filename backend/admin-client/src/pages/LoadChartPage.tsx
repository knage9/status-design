import React, { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Space, Spin, Empty, Button, Badge, Divider, App, Grid, Select, Input, Flex, Col, Tag, theme } from 'antd';
import { UserOutlined, ClockCircleOutlined, CarOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import FilterBar from '../components/FilterBar';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

interface WorkOrderCard {
    id: number;
    orderNumber: string;
    carBrand: string;
    carModel: string;
    vin?: string | null;
    customerName: string;
    executorName?: string;
    masterName?: string;
    managerName?: string;
    totalAmount: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    status: string;
}

interface LoadChartData {
    stages: Record<string, WorkOrderCard[]>;
}

type StageKey = 'NEW' | 'DEAL' | 'IN_WORK' | 'DONE' | 'DELIVERED';

const stageConfig: Array<{
    key: StageKey;
    label: string;
    statuses: string[];
    updateStatus: string;
    color: string;
    isTerminal?: boolean;
}> = [
    {
        key: 'NEW',
        label: 'Новое',
        statuses: ['NEW'],
        updateStatus: 'NEW',
        color: '#1677ff',
    },
    {
        key: 'DEAL',
        label: 'Сделка',
        statuses: ['ASSIGNED_TO_MASTER'],
        updateStatus: 'ASSIGNED_TO_MASTER',
        color: '#13c2c2',
    },
    {
        key: 'IN_WORK',
        label: 'В работе',
        statuses: ['ASSIGNED_TO_EXECUTOR', 'IN_PROGRESS', 'PAINTING', 'POLISHING'],
        updateStatus: 'IN_PROGRESS',
        color: '#fa8c16',
    },
    {
        key: 'DONE',
        label: 'Выполнено',
        statuses: ['ASSEMBLY_STAGE', 'ASSEMBLED', 'READY'],
        updateStatus: 'ASSEMBLY_STAGE',
        color: '#52c41a',
    },
    {
        key: 'DELIVERED',
        label: 'Отправлен / Выдан',
        statuses: ['SENT', 'SHIPPED', 'ISSUED', 'COMPLETED'],
        updateStatus: 'ISSUED',
        color: '#8c8c8c',
        isTerminal: true,
    },
];

const statusLabels: Record<string, { label: string; color: string }> = {
    NEW: { label: 'Новое', color: '#1677ff' },
    ASSIGNED_TO_MASTER: { label: 'Сделка', color: '#13c2c2' },
    ASSIGNED_TO_EXECUTOR: { label: 'В работе', color: '#fa8c16' },
    IN_PROGRESS: { label: 'В работе', color: '#fa8c16' },
    PAINTING: { label: 'В работе', color: '#fa8c16' },
    POLISHING: { label: 'В работе', color: '#fa8c16' },
    ASSEMBLY_STAGE: { label: 'Выполнено', color: '#52c41a' },
    ASSEMBLED: { label: 'Выполнено', color: '#52c41a' },
    READY: { label: 'Выполнено', color: '#52c41a' },
    SENT: { label: 'Отправлен / Выдан', color: '#8c8c8c' },
    SHIPPED: { label: 'Отправлен / Выдан', color: '#8c8c8c' },
    ISSUED: { label: 'Отправлен / Выдан', color: '#8c8c8c' },
    COMPLETED: { label: 'Отправлен / Выдан', color: '#8c8c8c' },
};

type Filters = { search: string; statuses: StageKey[] };

const normalizeStages = (sourceStages: Record<string, WorkOrderCard[]>, filters: Filters) => {
    const result: Record<StageKey, WorkOrderCard[]> = {} as Record<StageKey, WorkOrderCard[]>;
    const searchTerm = filters.search.trim().toLowerCase();
    const selectedStages = new Set(filters.statuses);

    stageConfig.forEach(stage => {
        if (selectedStages.size && !selectedStages.has(stage.key)) {
            result[stage.key] = [];
            return;
        }

        const cards = stage.statuses.flatMap(status => sourceStages?.[status] || []);
        const filteredCards = cards
            .filter(card => {
                if (!searchTerm) return true;
                const haystack = [
                    card.orderNumber,
                    card.carBrand,
                    card.carModel,
                    card.customerName,
                    card.executorName || '',
                    card.masterName || '',
                    card.managerName || '',
                    card.vin || '',
                ].join(' ').toLowerCase();
                return haystack.includes(searchTerm);
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        result[stage.key] = filteredCards;
    });

    return result;
};

const LoadChartPage: React.FC = () => {
    const [data, setData] = useState<LoadChartData | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px
    const { token } = useToken();
    const isDarkMode = token.colorBgBase === '#141414' || document.documentElement.getAttribute('data-theme') === 'dark';
    const defaultFilters: Filters = { search: '', statuses: [] };
    const [filters, setFilters] = useState<Filters>(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);

    const fetchLoadChart = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/load-chart');
            setData(response.data);
        } catch (error) {
            console.error('Failed to load load chart:', error);
            notification.error({ title: 'Ошибка загрузки данных', message: 'Не удалось загрузить график загрузки' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoadChart();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination || !data) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const sourceStageKey = source.droppableId as StageKey;
        const destStageKey = destination.droppableId as StageKey;
        const sourceStage = stageConfig.find(stage => stage.key === sourceStageKey);
        const destStage = stageConfig.find(stage => stage.key === destStageKey);
        if (!sourceStage || !destStage) return;

        if (sourceStage.isTerminal && destStageKey !== sourceStageKey) {
            notification.warning({
                title: 'Перетаскивание ограничено',
                message: 'Закрытые заказ-наряды нужно переоткрывать отдельно.',
            });
            return;
        }

        const currentBoard = normalizedStages || normalizeStages(data.stages, appliedFilters);
        const sourceCards = currentBoard?.[sourceStageKey] || [];
        const movedCard = sourceCards[source.index];
        if (!movedCard) return;

        const isSameStage = sourceStageKey === destStageKey;
        const targetStatus = isSameStage ? movedCard.status : destStage.updateStatus;
        if (!targetStatus) return;

        const workOrderId = parseInt(draggableId);

        // Optimistic update
        const prevData = JSON.parse(JSON.stringify(data));
        const newData: LoadChartData = { stages: { ...data.stages } };

        // Remove from actual status bucket
        const sourceList = [...(newData.stages[movedCard.status] || [])];
        const removeIdx = sourceList.findIndex(card => card.id === movedCard.id);
        if (removeIdx !== -1) {
            sourceList.splice(removeIdx, 1);
            newData.stages[movedCard.status] = sourceList;
        }

        // Add into target status bucket
        const destList = [...(newData.stages[targetStatus] || [])];
        const updatedCard = { ...movedCard, status: targetStatus };
        destList.splice(destination.index, 0, updatedCard);
        newData.stages[targetStatus] = destList;

        setData(newData);

        try {
            await api.patch(`/work-orders/${workOrderId}`, { status: targetStatus });
            notification.success({
                title: 'Статус обновлен',
                message: `З/Н #${movedCard.orderNumber} перемещен в "${destStage.label}"`,
                duration: 2
            });
        } catch (error) {
            console.error('Failed to update work order status:', error);
            setData(prevData);
            notification.error({ title: 'Ошибка обновления', message: 'Не удалось сохранить изменение статуса' });
        }
    };

    const normalizedStages = useMemo(() => {
        if (!data) return null;
        return normalizeStages(data.stages, appliedFilters);
    }, [data, appliedFilters]);

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
    };

    const renderColumn = (stageKey: StageKey, cards: WorkOrderCard[]) => {
        const stage = stageConfig.find(item => item.key === stageKey)!;
        const columnWidth = isMobile ? 240 : 300;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <Droppable droppableId={stageKey} key={stageKey}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                            minWidth: columnWidth,
                            maxWidth: columnWidth,
                            background: snapshot.isDraggingOver 
                                ? (isDarkMode ? 'rgba(24, 144, 255, 0.15)' : '#e6f7ff') 
                                : (isDarkMode ? token.colorFillQuaternary : '#f5f5f5'),
                            borderRadius: 8,
                            padding: isMobile ? 8 : 12,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? 8 : 12,
                            height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 180px)',
                            overflowY: 'auto',
                            transition: 'background-color 0.2s ease'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4,
                            position: 'sticky',
                            top: 0,
                            background: snapshot.isDraggingOver 
                                ? (isDarkMode ? 'rgba(24, 144, 255, 0.15)' : '#e6f7ff') 
                                : (isDarkMode ? token.colorFillQuaternary : '#f5f5f5'),
                            paddingBottom: 8,
                            zIndex: 1
                        }}>
                            <Title level={isMobile ? 5 : 5} style={{ margin: 0, fontSize: isMobile ? 13 : 14 }}>
                                {isMobile ? stage.label.substring(0, 14) + (stage.label.length > 14 ? '...' : '') : stage.label}
                            </Title>
                            <Badge count={cards.length} color={stage.color} showZero overflowCount={99} />
                        </div>

                        {cards.length === 0 && !snapshot.isDraggingOver ? (
                            <div style={{ padding: '20px 0', textAlign: 'center', opacity: 0.5 }}>
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пусто" />
                            </div>
                        ) : (
                            cards.map((card, index) => (
                                <Draggable key={card.id.toString()} draggableId={card.id.toString()} index={index}>
                                    {(provided, snapshot) => (
                                        <Card
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            size="small"
                                            hoverable
                                            onClick={() => navigate(`/work-orders/${card.id}`)}
                                            styles={{ body: { padding: isMobile ? 8 : 12 } }}
                                            style={{
                                                ...provided.draggableProps.style,
                                                border: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}`,
                                                borderLeft: `4px solid ${stage.color}`,
                                                background: isDarkMode ? token.colorBgContainer : '#fff',
                                                opacity: snapshot.isDragging ? 0.9 : 1,
                                                boxShadow: snapshot.isDragging 
                                                    ? (isDarkMode ? '0 6px 18px rgba(0,0,0,0.4)' : '0 6px 18px rgba(0,0,0,0.12)')
                                                    : (isDarkMode ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.04)'),
                                                cursor: 'grab',
                                                touchAction: 'none', // Important for touch drag
                                                borderRadius: 10
                                            }}
                                        >
                                            {(() => {
                                                const keyDate = card.startedAt || card.createdAt;
                                                const dateObj = keyDate ? new Date(keyDate) : null;
                                                const isToday = dateObj ? dateObj.toDateString() === new Date().toDateString() : false;
                                                const dateColor = isToday ? '#389e0d' : '#888';
                                                const statusMeta = statusLabels[card.status] || { label: card.status, color: stage.color };

                                                return (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8, alignItems: 'center' }}>
                                                            <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>#{card.orderNumber}</Text>
                                                            <Tag color={statusMeta.color} style={{ margin: 0, fontSize: 11, lineHeight: '18px' }}>
                                                                {statusMeta.label}
                                                            </Tag>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                                                            <Text style={{ fontSize: isMobile ? 10 : 11, color: dateColor }}>
                                                                <ClockCircleOutlined /> {dateObj ? dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                {isToday && ' · сегодня'}
                                                            </Text>
                                                            <Text strong style={{ color: '#1890ff', fontSize: isMobile ? 12 : 13 }}>
                                                                {card.totalAmount.toLocaleString()} ₽
                                                            </Text>
                                                        </div>
                                                    </>
                                                );
                                            })()}

                                            <div style={{ marginBottom: 6 }}>
                                                <Space align="start" size={4}>
                                                    <CarOutlined style={{ marginTop: 4, fontSize: isMobile ? 12 : 14 }} />
                                                    <div>
                                                        <Text strong style={{ fontSize: isMobile ? 12 : 13 }}>
                                                            {card.carBrand} {card.carModel}
                                                        </Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                                                            {card.customerName}
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </div>

                                            {(card.executorName || card.managerName) && (
                                                <>
                                                    <Divider style={{ margin: '6px 0' }} />
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {card.executorName && (
                                                            <Tag 
                                                                icon={<UserOutlined />} 
                                                                color={isDarkMode ? 'blue' : undefined}
                                                                style={{ 
                                                                    ...(isDarkMode ? {} : { backgroundColor: '#f0f5ff', borderColor: '#d6e4ff', color: '#1d39c4' }), 
                                                                    margin: 0 
                                                                }}
                                                            >
                                                                Исп: <Text strong>{card.executorName}</Text>
                                                            </Tag>
                                                        )}
                                                        {card.managerName && (
                                                            <Tag 
                                                                color={isDarkMode ? 'default' : undefined}
                                                                style={{ 
                                                                    ...(isDarkMode ? {} : { backgroundColor: '#fafafa', borderColor: '#d9d9d9', color: '#595959' }), 
                                                                    margin: 0 
                                                                }}
                                                            >
                                                                Менеджер: {card.managerName}
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </Card>
                                    )}
                                </Draggable>
                            ))
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        );
    };

    if (loading && !data) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large">
                    <div style={{ marginTop: 48 }}>Загрузка доски...</div>
                </Spin>
            </div>
        );
    }

    const stagesSource: Record<StageKey, WorkOrderCard[]> = normalizedStages || (data ? normalizeStages(data.stages, defaultFilters) : {} as Record<StageKey, WorkOrderCard[]>);
    const stagesToRender = appliedFilters.statuses.length
        ? stageConfig.filter(stage => appliedFilters.statuses.includes(stage.key))
        : stageConfig;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? 12 : 24,
                flexWrap: 'wrap',
                gap: 12
            }}>
                <Title level={isMobile ? 4 : 2} style={{ margin: 0 }}>
                    График загрузки
                </Title>
                <Button
                    type="primary"
                    ghost
                    onClick={fetchLoadChart}
                    icon={<ReloadOutlined />}
                    size={isMobile ? 'middle' : 'middle'}
                >
                    {!isMobile && 'Обновить'}
                </Button>
            </div>

            <FilterBar
                actions={
                    <Flex gap={8} wrap className="filter-bar-actions">
                        <Button onClick={handleResetFilters}>Сбросить</Button>
                        <Button type="primary" onClick={handleApplyFilters}>Применить</Button>
                    </Flex>
                }
            >
                <Col xs={24} sm={12} md={8}>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Поиск: № ЗН, клиент, авто, исполнитель"
                        allowClear
                        size="large"
                        value={filters.search}
                        style={{ width: '100%', minWidth: 260 }}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        onPressEnter={handleApplyFilters}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Select
                        mode="multiple"
                        placeholder="Этапы"
                        size="large"
                        allowClear
                        value={filters.statuses}
                        style={{ width: '100%', minWidth: 240 }}
                        onChange={(value) => setFilters(prev => ({ ...prev, statuses: value as StageKey[] }))}
                        options={stageConfig.map(stage => ({ label: stage.label, value: stage.key }))}
                    />
                </Col>
            </FilterBar>

                                            {isMobile && (
                <div style={{
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: isDarkMode ? 'rgba(24, 144, 255, 0.15)' : '#e6f7ff',
                    borderRadius: 4,
                    fontSize: 12,
                    color: isDarkMode ? token.colorTextSecondary : undefined
                }}>
                    💡 Прокрутите горизонтально для просмотра всех этапов. Нажмите и удерживайте карточку для перемещения.
                </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <div
                    className="scroll-x-mobile"
                    style={{
                        display: 'flex',
                        gap: isMobile ? 12 : 16,
                        overflowX: 'auto',
                        paddingBottom: 16,
                        flex: 1,
                        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
                    }}
                >
                    {data && stagesToRender.map(stage => renderColumn(stage.key, stagesSource[stage.key] || []))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default LoadChartPage;
