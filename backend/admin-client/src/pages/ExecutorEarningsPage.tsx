import React, { useEffect, useState } from 'react';
import {
    Card, Typography, Space, Spin, Table, Tag, App, DatePicker, Button, Statistic, Row, Col, Grid, Flex, Divider, theme
} from 'antd';
import { DollarOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import api from '../api';

dayjs.locale('ru');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { useToken } = theme;

interface Assignment {
    id: number;
    amount: number;
    description: string;
    workType: string;
    workOrder: {
        id: number;
        orderNumber: string;
        carText: string;
        completedAt: string;
    };
}

type RangePreset = 'week' | 'month' | 'custom';

const ExecutorEarningsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [totalEarned, setTotalEarned] = useState(0);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [preset, setPreset] = useState<RangePreset>('week');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('week'), dayjs().endOf('week')]);
    const { notification } = App.useApp();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const { token } = useToken();
    const isDarkMode = token.colorBgBase === '#141414' || document.documentElement.getAttribute('data-theme') === 'dark';

    const fetchEarnings = async (start: Dayjs, end: Dayjs) => {
        try {
            setLoading(true);
            const response = await api.get('/executor-stats/earnings', {
                params: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                }
            });
            setTotalEarned(response.data.totalEarned || 0);
            setAssignments(response.data.assignments || []);
        } catch (error) {
            notification.error({ title: 'Ошибка загрузки выплат' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings(dateRange[0], dateRange[1]);
    }, []);

    const applyPreset = (p: RangePreset) => {
        setPreset(p);
        let range: [Dayjs, Dayjs];
        if (p === 'week') {
            range = [dayjs().startOf('week'), dayjs().endOf('week')];
        } else if (p === 'month') {
            range = [dayjs().startOf('month'), dayjs().endOf('month')];
        } else {
            return; // custom — wait for DatePicker selection
        }
        setDateRange(range);
        fetchEarnings(range[0], range[1]);
    };

    const columns = [
        {
            title: 'Заказ-наряд',
            key: 'order',
            render: (_: any, record: Assignment) => (
                <Space direction="vertical" size={0}>
                    <Text strong>#{record.workOrder.orderNumber}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.workOrder.carText}</Text>
                </Space>
            )
        },
        {
            title: 'Работа',
            key: 'work',
            render: (_: any, record: Assignment) => (
                <Space direction="vertical" size={0}>
                    <Tag color="blue" style={{ margin: 0 }}>{record.workType}</Tag>
                    {record.description && <Text type="secondary" style={{ fontSize: 11 }}>{record.description}</Text>}
                </Space>
            )
        },
        {
            title: 'Дата завершения',
            dataIndex: ['workOrder', 'completedAt'],
            key: 'completedAt',
            render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—',
        },
        {
            title: 'Сумма выплаты',
            dataIndex: 'amount',
            key: 'amount',
            render: (v: number) => <Text strong style={{ color: '#52c41a' }}>{(v || 0).toLocaleString('ru-RU')} ₽</Text>,
        },
    ];

    return (
        <div style={{ paddingBottom: 40 }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 12
            }}>
                <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
                    Мои заработки
                </Title>
            </div>

            {/* Preset buttons + DatePicker */}
            <Card style={{ marginBottom: 24 }}>
                <Flex gap={12} wrap align="center">
                    <Space>
                        <Button
                            type={preset === 'week' ? 'primary' : 'default'}
                            icon={<CalendarOutlined />}
                            onClick={() => applyPreset('week')}
                        >
                            Эта неделя
                        </Button>
                        <Button
                            type={preset === 'month' ? 'primary' : 'default'}
                            icon={<CalendarOutlined />}
                            onClick={() => applyPreset('month')}
                        >
                            Этот месяц
                        </Button>
                        <Button
                            type={preset === 'custom' ? 'primary' : 'default'}
                            onClick={() => setPreset('custom')}
                        >
                            Произвольный период
                        </Button>
                    </Space>

                    {preset === 'custom' && (
                        <Space>
                            <RangePicker
                                value={dateRange}
                                format="DD.MM.YYYY"
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) {
                                        const range: [Dayjs, Dayjs] = [dates[0], dates[1]];
                                        setDateRange(range);
                                    }
                                }}
                            />
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => fetchEarnings(dateRange[0], dateRange[1])}
                            >
                                Загрузить
                            </Button>
                        </Space>
                    )}
                </Flex>
            </Card>

            {/* Summary Block */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card style={{ background: isDarkMode ? token.colorFillQuaternary : '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <Statistic
                            title="Итого заработано за период"
                            value={totalEarned}
                            suffix="₽"
                            precision={0}
                            valueStyle={{ color: '#52c41a', fontSize: 28 }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card style={{ background: isDarkMode ? token.colorFillQuaternary : '#e6f7ff', border: '1px solid #91d5ff' }}>
                        <Statistic
                            title="Работ за период"
                            value={assignments.length}
                            valueStyle={{ color: '#1890ff', fontSize: 28 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider />

            {/* Table */}
            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Spin size="large" />
                    </div>
                ) : assignments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Text type="secondary">За выбранный период выплат не найдено.</Text>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={assignments}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                )}
            </Card>
        </div>
    );
};

export default ExecutorEarningsPage;
