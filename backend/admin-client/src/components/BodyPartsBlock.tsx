import React from 'react';
import {
    Card,
    Form,
    InputNumber,
    Select,
    Row,
    Col,
    Typography,
    Space,
    Tag,
} from 'antd';

const { Text, Title } = Typography;
const { Option } = Select;

interface BodyPartsBlockProps {
    executors: any[];
    showBodyParts: boolean;
}

const BodyPartsBlock: React.FC<BodyPartsBlockProps> = ({ executors, showBodyParts }) => {
    if (!showBodyParts) return null;

    const bodyParts = [
        { key: 'radiatorGrille', label: 'Решётка радиатора' },
        { key: 'fogLights', label: 'ПТФ (противотуманки)' },
        { key: 'fenders', label: 'Крылья' },
        { key: 'doorHandles', label: 'Ручки дверей' },
        { key: 'badges', label: 'Значки' },
        { key: 'inscriptions', label: 'Надписи', hasLetterCount: true },
        { key: 'hubCaps', label: 'Колпачки' },
        { key: 'railings', label: 'Рейлинги' },
    ];

    const partStatuses = [
        { value: 'pending', label: 'Ожидание', color: '#faad14' },
        { value: 'disassembled', label: 'Разобрано', color: '#1890ff' },
        { value: 'assembled', label: 'Собрано', color: '#52c41a' },
    ];

    const PRICE_PER_PART = 400;

    return (
        <Card
            type="inner"
            title={
                <Space>
                    <Title level={5} style={{ margin: 0 }}>🚗 Детали кузова</Title>
                    <Tag color="orange">Антихром / Полировка</Tag>
                </Space>
            }
            style={{
                marginBottom: 32,
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #ffd591'
            }}
            headStyle={{ background: '#fff7e6', borderBottom: '1px solid #ffd591' }}
        >
            <div style={{ padding: '0 8px' }}>
                <Row gutter={[16, 16]} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f0f0f0' }}>
                    <Col span={5}><Text strong type="secondary">Деталь</Text></Col>
                    <Col span={3}><Text strong type="secondary">План</Text></Col>
                    <Col span={3}><Text strong type="secondary">Факт</Text></Col>
                    <Col span={3}><Text strong type="secondary">Сумма</Text></Col>
                    <Col span={4}><Text strong type="secondary">Статус</Text></Col>
                    <Col span={6}><Text strong type="secondary">Исполнитель</Text></Col>
                </Row>

                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                    {bodyParts.map(part => (
                        <div key={part.key} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <Form.Item noStyle shouldUpdate={(prev, curr) => prev[`${part.key}Quantity`] !== curr[`${part.key}Quantity`]}>
                                {({ getFieldValue }) => {
                                    const qty = getFieldValue(`${part.key}Quantity`) || 0;
                                    const sum = qty * PRICE_PER_PART;

                                    return (
                                        <Row gutter={16} align="middle">
                                            <Col span={5}>
                                                <Text strong style={{ fontSize: '14px' }}>{part.label}</Text>
                                                {part.hasLetterCount && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <Form.Item
                                                            name={`${part.key}LetterCount`}
                                                            label={<span style={{ fontSize: '12px' }}>Букв</span>}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <InputNumber size="small" min={0} style={{ width: 60 }} />
                                                        </Form.Item>
                                                    </div>
                                                )}
                                            </Col>
                                            <Col span={3}>
                                                <Form.Item name={`${part.key}Quantity`} noStyle>
                                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="шт" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={3}>
                                                <Form.Item name={`${part.key}ActualQuantity`} noStyle>
                                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="шт" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={3}>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    background: sum > 0 ? '#f6ffed' : '#fafafa',
                                                    borderRadius: 4,
                                                    border: `1px solid ${sum > 0 ? '#b7eb8f' : '#d9d9d9'}`,
                                                    textAlign: 'center'
                                                }}>
                                                    <Text strong style={{ color: sum > 0 ? '#389e0d' : '#999' }}>
                                                        {sum} ₽
                                                    </Text>
                                                </div>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item name={`${part.key}Status`} noStyle initialValue="pending">
                                                    <Select style={{ width: '100%' }} size="small">
                                                        {partStatuses.map(status => (
                                                            <Option key={status.value} value={status.value}>
                                                                <span style={{ color: status.color }}>{status.label}</span>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name={`${part.key}ExecutorId`} noStyle>
                                                    <Select
                                                        placeholder="Исполнитель"
                                                        style={{ width: '100%' }}
                                                        allowClear
                                                        showSearch
                                                        size="small"
                                                        optionFilterProp="children"
                                                    >
                                                        {executors.map(executor => (
                                                            <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    );
                                }}
                            </Form.Item>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 16, textAlign: 'right', padding: '12px', background: '#fafafa', borderRadius: 8 }}>
                    <Text type="secondary">Тариф: {PRICE_PER_PART} ₽ за деталь</Text>
                </div>
            </div>
        </Card>
    );
};

export default BodyPartsBlock;
