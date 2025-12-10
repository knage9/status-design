import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, App, Radio, Space } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

interface WorkOrder {
    id: number;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    carBrand: string;
    carModel: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    manager?: { name: string };
    master?: { name: string };
    executor?: { name: string };
}

const WorkOrdersPage: React.FC = () => {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('my');
    const { notification } = App.useApp();
    const navigate = useNavigate();

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/work-orders/admin?view=${viewMode}`);
            setWorkOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch work orders:', error);
            notification.error({ title: 'Ошибка загрузки заказ-нарядов' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkOrders();
    }, [viewMode]);

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

    const getPaymentMethodText = (method: string) => {
        const texts: Record<string, string> = {
            CASH: 'Наличные',
            NON_CASH: 'Безналичные',
            WITHOUT_VAT: 'Без НДС',
        };
        return texts[method] || method;
    };

    const columns = [
        {
            title: '№ Заказ-наряда',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 150,
            render: (num: string) => <strong>{num}</strong>,
        },
        {
            title: 'Заказчик',
            dataIndex: 'customerName',
            key: 'customerName',
            width: 150,
        },
        {
            title: 'Автомобиль',
            key: 'car',
            width: 150,
            render: (_: any, record: WorkOrder) => `${record.carBrand} ${record.carModel}`,
        },
        {
            title: 'Сумма',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 120,
            render: (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`,
        },
        {
            title: 'Оплата',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 120,
            render: (method: string) => getPaymentMethodText(method),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: 180,
            filters: [
                { text: 'Новый', value: 'NEW' },
                { text: 'Назначен мастеру', value: 'ASSIGNED_TO_MASTER' },
                { text: 'В работе', value: 'IN_PROGRESS' },
                { text: 'На проверке', value: 'UNDER_REVIEW' },
                { text: 'Завершен', value: 'COMPLETED' },
            ],
            onFilter: (value: any, record: WorkOrder) => record.status === value,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
            ),
        },
        {
            title: 'Менеджер',
            dataIndex: 'manager',
            key: 'manager',
            width: 120,
            render: (manager?: { name: string }) => manager?.name || '—',
        },
        {
            title: 'Мастер',
            dataIndex: 'master',
            key: 'master',
            width: 120,
            render: (master?: { name: string }) => master?.name || '—',
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            sorter: (a: WorkOrder, b: WorkOrder) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            defaultSortOrder: 'descend' as const,
            render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 120,
            render: (_: any, record: WorkOrder) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/work-orders/${record.id}`)}
                >
                    Открыть
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Card
                title="Заказ-наряды"
                extra={
                    <Space>
                        <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="my">Мои</Radio.Button>
                            <Radio.Button value="all">Все</Radio.Button>
                        </Radio.Group>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/work-orders/new')}
                        >
                            Создать заказ-наряд
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={workOrders}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    scroll={{ x: 1500 }}
                />
            </Card>
        </div>
    );
};

export default WorkOrdersPage;
