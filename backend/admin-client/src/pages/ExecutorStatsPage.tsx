import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, InputNumber, Tag, App, Typography, Space, Drawer, Descriptions, Grid, Flex, FloatButton, Divider } from 'antd';
import { EyeOutlined, DollarOutlined, LoadingOutlined, CheckCircleOutlined, InfoCircleOutlined, ExportOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/dashboard/executor-stats');
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
            const response = await axios.get(`/api/dashboard/executor-stats`, {
                params: { executorId: executor.executor.id }
            });
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
            id: work.id,
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
                `/api/dashboard/update-payment/${selectedWorkOrder.id}`,
                {
                    paidAmount: values.paidAmount,
                    isPaid: values.paidAmount >= selectedWorkOrder.amount
                }
            );
            notification.success({ title: 'Успех', description: 'Оплата зафиксирована' });
            setPaymentModalVisible(false);
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

    // Mobile Executor Card
    const MobileExecutorCard = ({ executor }: { executor: ExecutorSummary }) => (
        <Card
            size="small"
            style={{ marginBottom: 12 }}
            hoverable
            onClick={() => handleViewDetails(executor)}
        >
            <Flex vertical gap={8}>
                <Flex justify="space-between" align="start">
                    <div>
                        <Text strong style={{ fontSize: 16 }}>{executor.executor.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {executor.executor.email}
                        </Text>
                    </div>
                    <Tag style={{ fontSize: 13, padding: '4px 8px' }}>{executor.workOrdersCount} работ</Tag>
                </Flex>

                <Divider style={{ margin: '8px 0' }} />

                <Flex vertical gap={4}>
                    <Flex justify="space-between">
                        <Text type="secondary">Заработано:</Text>
                        <Text strong style={{ fontSize: 15 }}>{executor.totalEarned.toLocaleString()} ₽</Text>
                    </Flex>
                    <Flex justify="space-between">
                        <Text type="secondary">Выплачено:</Text>
                        <Text type="success" strong style={{ fontSize: 15 }}>{executor.paidAmount.toLocaleString()} ₽</Text>
                    </Flex>
                    <Flex justify="space-between">
                        <Text type="secondary">Остаток:</Text>
                        <Tag color={executor.remaining > 0 ? 'orange' : 'green'} style={{ fontSize: 15, padding: '4px 10px', margin: 0 }}>
                            {executor.remaining.toLocaleString()} ₽
                        </Tag>
                    </Flex>
                </Flex>

                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="large"
                    block
                    style={{ marginTop: 8 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(executor);
                    }}
                >
                    Посмотреть детали
                </Button>
            </Flex>
        </Card>
    );

    // Mobile Work Item Card (for drawer)
    const MobileWorkCard = ({ work }: { work: WorkItem }) => (
        <Card size="small" style={{ marginBottom: 12 }}>
            <Flex vertical gap={8}>
                <Flex justify="space-between" align="center">
                    <Text strong>#{work.workOrderNumber}</Text>
                    {work.isPaid ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">Оплачено</Tag>
                    ) : (
                        <Tag icon={<InfoCircleOutlined />} color="warning">Ожидает</Tag>
                    )}
                </Flex>

                <Divider style={{ margin: '4px 0' }} />

                <Flex vertical gap={4}>
                    <Text style={{ fontSize: 13 }}>{work.carModel}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{work.customerName}</Text>
                    <Tag color="blue" style={{ width: 'fit-content', margin: '4px 0' }}>
                        {work.serviceType || work.workType}
                    </Tag>
                    {work.description && (
                        <Text type="secondary" style={{ fontSize: 11 }}>{work.description}</Text>
                    )}
                </Flex>

                <Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                        {work.amount.toLocaleString()} ₽
                    </Text>
                    {!work.isPaid && (
                        <Button
                            type="primary"
                            size="middle"
                            icon={<DollarOutlined />}
                            onClick={() => handleOpenPayment(work)}
                        >
                            Оплатить
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Card>
    );

    const columns = [
        {
            title: 'Исполнитель',
            dataIndex: ['executor', 'name'],
            key: 'name',
            render: (text: string, record: ExecutorSummary) => (
                <Space orientation="vertical" size={0}>
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
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 12
            }}>
                <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
                    {isMobile ? 'Статистика выплат' : 'Статистика и выплаты исполнителям'}
                </Title>
                {!isMobile && (
                    <Button icon={<ExportOutlined />} onClick={exportToCSV}>Экспорт CSV</Button>
                )}
            </div>

            <Card bordered={false} className="shadow-sm">
                {isMobile ? (
                    /* Mobile Card List */
                    <div>
                        {loading ? (
                            <Card loading={true} />
                        ) : stats.length > 0 ? (
                            stats.map(executor => (
                                <MobileExecutorCard key={executor.executor.id} executor={executor} />
                            ))
                        ) : (
                            <Card>
                                <Text type="secondary">Нет данных</Text>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Desktop Table */
                    <Table
                        columns={columns}
                        dataSource={stats}
                        rowKey={(record) => record.executor.id}
                        loading={loading}
                        pagination={false}
                    />
                )}
            </Card>

            {/* FAB for export on mobile */}
            {isMobile && (
                <FloatButton
                    icon={<ExportOutlined />}
                    type="default"
                    style={{ right: 24, bottom: 24 }}
                    onClick={exportToCSV}
                    tooltip="Экспорт CSV"
                />
            )}

            <Drawer
                title={`Работы: ${selectedExecutor?.executor.name}`}
                placement="right"
                width={isMobile ? '100%' : 800}
                onClose={() => setDetailsDrawerVisible(false)}
                open={detailsDrawerVisible}
            >
                {detailsLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><LoadingOutlined style={{ fontSize: 24 }} /></div>
                ) : (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Card size="small" style={{ background: '#fafafa' }}>
                                <Descriptions column={isMobile ? 1 : 3} size={isMobile ? 'small' : 'middle'}>
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

                        {isMobile ? (
                            /* Mobile Work Cards */
                            <div>
                                {executorDetails.map(work => (
                                    <MobileWorkCard key={work.id} work={work} />
                                ))}
                            </div>
                        ) : (
                            /* Desktop Table */
                            <Table
                                columns={detailColumns}
                                dataSource={executorDetails}
                                rowKey="id"
                                size="small"
                            />
                        )}
                    </>
                )}
            </Drawer>

            <Modal
                title={`Оплата по З/Н #${selectedWorkOrder?.number}`}
                open={paymentModalVisible}
                onCancel={() => setPaymentModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
                width={isMobile ? '100%' : 520}
                style={isMobile ? { top: 0, maxWidth: '100%', padding: 0 } : undefined}
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
