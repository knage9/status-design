import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Spin, Empty, Button, Badge, Divider, App, Grid } from 'antd';
import { UserOutlined, ClockCircleOutlined, CarOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface WorkOrderCard {
    id: number;
    orderNumber: string;
    carBrand: string;
    carModel: string;
    customerName: string;
    executorName?: string;
    masterName?: string;
    managerName?: string;
    totalAmount: number;
    createdAt: string;
    status: string;
}

interface LoadChartData {
    stages: Record<string, WorkOrderCard[]>;
}

const statusLabels: Record<string, { label: string, color: string }> = {
    'NEW': { label: 'Новый', color: 'blue' },
    'ASSIGNED_TO_MASTER': { label: 'У мастера', color: 'cyan' },
    'ASSIGNED_TO_EXECUTOR': { label: 'Назначен', color: 'purple' },
    'IN_PROGRESS': { label: 'В работе', color: 'orange' },
    'PAINTING': { label: 'Покраска', color: 'volcano' },
    'POLISHING': { label: 'Полировка', color: 'gold' },
    'ASSEMBLY_STAGE': { label: 'Сборка', color: 'lime' },
    'UNDER_REVIEW': { label: 'На проверке', color: 'magenta' },
    'APPROVED': { label: 'Одобрен', color: 'green' },
    'RETURNED_FOR_REVISION': { label: 'Доработка', color: 'red' },
    'SENT': { label: 'Отправлен', color: 'geekblue' },
    'SHIPPED': { label: 'Доставлен', color: 'blue' },
    'ASSEMBLED': { label: 'Собран', color: 'cyan' },
    'ISSUED': { label: 'Выдан', color: 'gray' },
    'READY': { label: 'Готов', color: 'success' },
    'COMPLETED': { label: 'Завершен', color: 'default' },
};

const LoadChartPage: React.FC = () => {
    const [data, setData] = useState<LoadChartData | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px

    const fetchLoadChart = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/dashboard/load-chart');
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

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const workOrderId = parseInt(draggableId);
        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;

        // Optimistic update
        const prevData = JSON.parse(JSON.stringify(data));
        const newData = { ...data! };

        // Remove from source
        const sourceCards = [...newData.stages[sourceStatus]];
        const [movedCard] = sourceCards.splice(source.index, 1);
        newData.stages[sourceStatus] = sourceCards;

        // Add to destination
        const destCards = newData.stages[destStatus] ? [...newData.stages[destStatus]] : [];
        movedCard.status = destStatus;
        destCards.splice(destination.index, 0, movedCard);
        newData.stages[destStatus] = destCards;

        setData(newData);

        try {
            await axios.patch(`/api/work-orders/${workOrderId}`, { status: destStatus });
            notification.success({
                title: 'Статус обновлен',
                message: `З/Н #${movedCard.orderNumber} перемещен в этап "${statusLabels[destStatus]?.label}"`,
                duration: 2
            });
        } catch (error) {
            console.error('Failed to update work order status:', error);
            setData(prevData);
            notification.error({ title: 'Ошибка обновления', message: 'Не удалось сохранить изменение статуса' });
        }
    };

    const renderColumn = (status: string, cards: WorkOrderCard[]) => {
        const config = statusLabels[status] || { label: status, color: 'default' };
        const columnWidth = isMobile ? 240 : 300;

        return (
            <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                            minWidth: columnWidth,
                            maxWidth: columnWidth,
                            background: snapshot.isDraggingOver ? '#e6f7ff' : '#f5f5f5',
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
                            background: snapshot.isDraggingOver ? '#e6f7ff' : '#f5f5f5',
                            paddingBottom: 8,
                            zIndex: 1
                        }}>
                            <Title level={isMobile ? 5 : 5} style={{ margin: 0, fontSize: isMobile ? 13 : 14 }}>
                                {isMobile ? config.label.substring(0, 10) + (config.label.length > 10 ? '...' : '') : config.label}
                            </Title>
                            <Badge count={cards.length} color={config.color} showZero overflowCount={99} />
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
                                                borderLeft: `4px solid ${config.color === 'success' ? '#52c41a' : config.color === 'default' ? '#d9d9d9' : '#1890ff'}`,
                                                opacity: snapshot.isDragging ? 0.8 : 1,
                                                boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                                cursor: 'grab',
                                                touchAction: 'none' // Important for touch drag
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>#{card.orderNumber}</Text>
                                                <Text type="secondary" style={{ fontSize: isMobile ? 10 : 11 }}>
                                                    <ClockCircleOutlined /> {new Date(card.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                                                </Text>
                                            </div>

                                            <div style={{ marginBottom: 8 }}>
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

                                            {(card.executorName || card.masterName) && (
                                                <>
                                                    <Divider style={{ margin: '6px 0' }} />
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        {card.executorName && (
                                                            <Text style={{ fontSize: isMobile ? 11 : 12 }}>
                                                                <UserOutlined /> Исп: <Text strong>{card.executorName}</Text>
                                                            </Text>
                                                        )}
                                                        {card.masterName && !isMobile && (
                                                            <Text style={{ fontSize: 11, color: '#888' }}>
                                                                Мастер: {card.masterName}
                                                            </Text>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <div style={{ marginTop: 8, textAlign: 'right' }}>
                                                <Text strong style={{ color: '#1890ff', fontSize: isMobile ? 12 : 13 }}>
                                                    {card.totalAmount.toLocaleString()} ₽
                                                </Text>
                                            </div>
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

    const stagesToRender = [
        'NEW', 'ASSIGNED_TO_MASTER', 'ASSIGNED_TO_EXECUTOR', 'IN_PROGRESS',
        'PAINTING', 'POLISHING', 'ASSEMBLY_STAGE', 'READY'
    ];

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

            {isMobile && (
                <div style={{
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: '#e6f7ff',
                    borderRadius: 4,
                    fontSize: 12
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
                    {data && stagesToRender.map(status => renderColumn(status, data.stages[status] || []))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default LoadChartPage;
