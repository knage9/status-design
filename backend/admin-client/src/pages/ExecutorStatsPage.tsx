import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, InputNumber, Tag, App, Typography, Space, Drawer, Descriptions } from 'antd';
import { EyeOutlined, DollarOutlined, LoadingOutlined, CheckCircleOutlined, InfoCircleOutlined, ExportOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface ExecutorSummary {
    executor: {
        id: number;
        name: string;
        email: string;
    };
    totalEarned: number;
    paidAmount: number;
    remaining: number;
    workOrdersCount: number;
    serviceBreakdown: Record<string, { count: number; amount: number }>;
}

interface WorkItem {
    id: number;
    workOrderId: number;
    workOrderNumber: string;
    workType: string;
    serviceType: string | null;
    description: string | null;
    amount: number;
    isPaid: boolean;
    paidAmount: number;
    createdAt: string;
    carModel: string;
    customerName: string;
    managerName?: string;
}

const ExecutorStatsPage: React.FC = () => {
    const [stats, setStats] = useState<ExecutorSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
    const [selectedExecutor, setSelectedExecutor] = useState<ExecutorSummary | null>(null);
    const [executorDetails, setExecutorDetails] = useState<WorkItem[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<{ id: number; number: string; amount: number } | null>(null);
    const [form] = Form.useForm();
    const { notification } = App.useApp();

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/dashboard/executor-stats');
            setStats(response.data);
        } catch (error) {
            notification.error({ title: 'Ошибка', description: 'Не удалось загрузить статистика' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleViewDetails = async (executor: ExecutorSummary) => {
        setSelectedExecutor(executor);
        setDetailsDrawerVisible(true);
        setDetailsLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/dashboard/executor-stats`, {
                params: { executorId: executor.executor.id }
            });
            // response.data is an array of 1 executor if executorId is passed
            if (response.data && response.data.length > 0) {
                setExecutorDetails(response.data[0].works);
            }
        } catch (error) {
            notification.error({ title: 'Ошибка', description: 'Не удалось загрузить детали' });
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleOpenPayment = (work: WorkItem) => {
        setSelectedWorkOrder({
            id: work.id, // work.id is the assignment ID
            number: work.workOrderNumber,
            amount: work.amount
        });
        form.setFieldsValue({ paidAmount: work.amount });
        setPaymentModalVisible(true);
    };

    const handlePaymentSubmit = async (values: any) => {
        if (!selectedExecutor || !selectedWorkOrder) return;
        try {
            await axios.patch(
                `http://localhost:3000/api/dashboard/update-payment/${selectedWorkOrder.id}`,
                {
                    paidAmount: values.paidAmount,
                    isPaid: values.paidAmount >= selectedWorkOrder.amount
                }
            );
            notification.success({ title: 'Успех', description: 'Оплата зафиксирована' });
            setPaymentModalVisible(false);
            // Refresh details and summary
            handleViewDetails(selectedExecutor);
            fetchStats();
        } catch (error) {
            notification.error({ title: 'Ошибка', description: 'Не удалось сохранить оплату' });
        }
    };

    const exportToCSV = () => {
        const headers = ['Имя', 'Email', 'Заботано', 'Выплачено', 'Остаток', 'Работ'];
        const rows = stats.map(s => [
            s.executor.name,
            s.executor.email,
            s.totalEarned,
            s.paidAmount,
            s.remaining,
            s.workOrdersCount
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `executor_stats_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: 'Исполнитель',
            dataIndex: ['executor', 'name'],
            key: 'name',
            render: (text: string, record: ExecutorSummary) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.executor.email}</Text>
                </Space>
            )
        },
        {
            title: 'Работ',
            dataIndex: 'workOrdersCount',
            key: 'workOrdersCount',
            align: 'center' as const,
        },
        {
            title: 'Заработано',
            dataIndex: 'totalEarned',
            key: 'totalEarned',
            render: (val: number) => <Text strong>{val.toLocaleString()} ₽</Text>,
        },
        {
            title: 'Выплачено',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            render: (val: number) => <Text type="success">{val.toLocaleString()} ₽</Text>,
        },
        {
            title: 'Остаток',
            dataIndex: 'remaining',
            key: 'remaining',
            render: (val: number) => (
                <Tag color={val > 0 ? 'orange' : 'green'} style={{ fontSize: 14, padding: '4px 8px' }}>
                    {val.toLocaleString()} ₽
                </Tag>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            align: 'right' as const,
            render: (_: any, record: ExecutorSummary) => (
                <Button
                    type="primary"
                    ghost
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                >
                    Детали
                </Button>
            ),
        },
    ];

    const detailColumns = [
        {
            title: 'З/Н',
            dataIndex: 'workOrderNumber',
            key: 'workOrderNumber',
            render: (text: string, record: WorkItem) => (
                <Space direction="vertical" size={0}>
                    <Text strong>#{text}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{new Date(record.createdAt).toLocaleDateString()}</Text>
                </Space>
            )
        },
        {
            title: 'Авто / Клиент',
            key: 'car',
            render: (_: any, record: WorkItem) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 13 }}>{record.carModel}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.customerName}</Text>
                </Space>
            )
        },
        {
            title: 'Работа',
            key: 'workType',
            render: (_: any, record: WorkItem) => (
                <Space direction="vertical" size={0}>
                    <Tag color="blue" style={{ margin: 0 }}>{record.serviceType || record.workType}</Tag>
                    {record.description && <Text type="secondary" style={{ fontSize: 11 }}>{record.description}</Text>}
                </Space>
            )
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => <Text strong>{val.toLocaleString()} ₽</Text>
        },
        {
            title: 'Статус',
            key: 'status',
            render: (_: any, record: WorkItem) => (
                record.isPaid ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">Оплачено</Tag>
                ) : (
                    <Tag icon={<InfoCircleOutlined />} color="warning">Ожидает</Tag>
                )
            )
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: WorkItem) => (
                !record.isPaid && (
                    <Button
                        size="small"
                        type="link"
                        icon={<DollarOutlined />}
                        onClick={() => handleOpenPayment(record)}
                    >
                        Оплатить
                    </Button>
                )
            )
        }
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Статистика и выплаты исполнителям</Title>
                <Button icon={<ExportOutlined />} onClick={exportToCSV}>Экспорт CSV</Button>
            </div>

            <Card bordered={false} className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={stats}
                    rowKey={(record) => record.executor.id}
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Drawer
                title={`Работы: ${selectedExecutor?.executor.name}`}
                placement="right"
                width={800}
                onClose={() => setDetailsDrawerVisible(false)}
                open={detailsDrawerVisible}
            >
                {detailsLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><LoadingOutlined style={{ fontSize: 24 }} /></div>
                ) : (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Card size="small" style={{ background: '#fafafa' }}>
                                <Descriptions column={3}>
                                    <Descriptions.Item label="Всего заработано">
                                        <Text strong>{selectedExecutor?.totalEarned.toLocaleString()} ₽</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Выплачено">
                                        <Text type="success" strong>{selectedExecutor?.paidAmount.toLocaleString()} ₽</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="К выплате">
                                        <Text type="danger" strong>{selectedExecutor?.remaining.toLocaleString()} ₽</Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>

                        <Table
                            columns={detailColumns}
                            dataSource={executorDetails}
                            rowKey="id"
                            size="small"
                        />
                    </>
                )}
            </Drawer>

            <Modal
                title={`Оплата по З/Н #${selectedWorkOrder?.number}`}
                open={paymentModalVisible}
                onCancel={() => setPaymentModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <div style={{ marginBottom: 20 }}>
                    <Text type="secondary">Начислено за работы в этом заказе: </Text>
                    <Text strong>{selectedWorkOrder?.amount.toLocaleString()} ₽</Text>
                </div>
                <Form form={form} layout="vertical" onFinish={handlePaymentSubmit}>
                    <Form.Item
                        name="paidAmount"
                        label="Сумма выплаты"
                        rules={[{ required: true, message: 'Укажите сумму' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            parser={value => value!.replace(/\s?|₽/g, '')}
                            addonAfter="₽"
                            size="large"
                        />
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <InfoCircleOutlined /> Нажатие "ОК" пометит все работы исполнителя в данном заказе как оплаченные на указанную сумму.
                    </Text>
                </Form>
            </Modal>
        </div>
    );
};

export default ExecutorStatsPage;
