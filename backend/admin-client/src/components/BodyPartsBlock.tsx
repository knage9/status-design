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
    Grid,
    Flex,
} from 'antd';

const { Text, Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

interface BodyPartsBlockProps {
    executors: any[];
    showBodyParts: boolean;
}

const BodyPartsBlock: React.FC<BodyPartsBlockProps> = ({ executors, showBodyParts }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px
    const isTablet = screens.md && !screens.lg; // 768px - 992px

    if (!showBodyParts) return null;

    const bodyParts = [
        { key: 'radiatorGrille', label: 'Решётка радиатора' },
        { key: 'frontBumper', label: 'Передний бампер' },
        { key: 'lip', label: 'Губа' },
        { key: 'hood', label: 'Капот' },
        { key: 'fogLights', label: 'ПТФ (противотуманки)' },
        { key: 'fenders', label: 'Крылья' },
        { key: 'windowMoldings', label: 'Оконные молдинги' },
        { key: 'vents', label: 'Форточки' },
        { key: 'doorHandles', label: 'Ручки дверей' },
        { key: 'doorMoldings', label: 'Дверные молдинги' },
        { key: 'mirrors', label: 'Зеркала' },
        { key: 'badges', label: 'Значки' },
        { key: 'inscriptions', label: 'Надписи', hasLetterCount: true },
        { key: 'trunkLid', label: 'Крышка багажника' },
        { key: 'spoiler', label: 'Спойлер' },
        { key: 'rearBumper', label: 'Задний бампер' },
        { key: 'diffuser', label: 'Диффузор' },
        { key: 'rearLights', label: 'Задние фонари' },
        { key: 'fakeExhausts', label: 'Фальш насадки' },
        { key: 'sills', label: 'Пороги' },
        { key: 'hubCaps', label: 'Колпачки' },
        { key: 'railings', label: 'Рейлинги' },
        { key: 'wheels', label: 'Колёса' },
        { key: 'nozzles', label: 'Насадки' },
    ];

    const SINGLE_QUANTITY_KEYS = [
        'frontBumper',
        'lip',
        'hood',
        'windowMoldings',
        'vents',
        'doorMoldings',
        'mirrors',
        'trunkLid',
        'spoiler',
        'rearBumper',
        'diffuser',
        'rearLights',
        'fakeExhausts',
        'sills'
    ];

    const partStatuses = [
        { value: 'pending', label: 'Ожидание', color: '#faad14' },
        { value: 'disassembled', label: 'Разобрано', color: '#1890ff' },
        { value: 'assembled', label: 'Собрано', color: '#52c41a' },
    ];

    const PRICE_PER_PART = 400;

    const isSingleQuantity = (key: string) => SINGLE_QUANTITY_KEYS.includes(key);

    // Mobile Render - Vertical Card Layout
    const renderMobilePart = (part: any) => {
        const isSingle = isSingleQuantity(part.key);

        return (
            <Form.Item noStyle key={part.key} shouldUpdate={(prev, curr) => prev[`${part.key}Quantity`] !== curr[`${part.key}Quantity`]}>
                {({ getFieldValue }) => {
                    const qty = getFieldValue(`${part.key}Quantity`) || 0;
                    const sum = qty * PRICE_PER_PART;

                    return (
                        <Card
                            size="small"
                            style={{
                                marginBottom: 16,
                                borderRadius: 8,
                                border: '1px solid #ffd591'
                            }}
                        >
                            <Flex vertical gap={12}>
                                <Flex justify="space-between" align="center">
                                    <Text strong style={{ fontSize: 16 }}>{part.label}</Text>
                                    <div style={{
                                        padding: '6px 12px',
                                        background: sum > 0 ? '#f6ffed' : '#fafafa',
                                        borderRadius: 6,
                                        border: `2px solid ${sum > 0 ? '#b7eb8f' : '#d9d9d9'}`
                                    }}>
                                        <Text strong style={{ color: sum > 0 ? '#389e0d' : '#999', fontSize: 16 }}>
                                            {sum} ₽
                                        </Text>
                                    </div>
                                </Flex>

                                {part.hasLetterCount && (
                                    <Form.Item
                                        name={`${part.key}LetterCount`}
                                        label="Количество букв"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <InputNumber size="large" min={0} style={{ width: '100%' }} placeholder="шт" />
                                    </Form.Item>
                                )}

                                {isSingle ? (
                                    <Form.Item label="Количество" name={`${part.key}Quantity`} style={{ marginBottom: 0 }}>
                                        <InputNumber size="large" min={0} style={{ width: '100%' }} placeholder="шт" />
                                    </Form.Item>
                                ) : (
                                    <Row gutter={12}>
                                        <Col span={12}>
                                            <Form.Item label="План" name={`${part.key}Quantity`} style={{ marginBottom: 0 }}>
                                                <InputNumber size="large" min={0} style={{ width: '100%' }} placeholder="шт" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Факт" name={`${part.key}ActualQuantity`} style={{ marginBottom: 0 }}>
                                                <InputNumber size="large" min={0} style={{ width: '100%' }} placeholder="шт" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )}

                                <Form.Item label="Статус" name={`${part.key}Status`} initialValue="pending" style={{ marginBottom: 0 }}>
                                    <Select size="large" style={{ width: '100%' }}>
                                        {partStatuses.map(status => (
                                            <Option key={status.value} value={status.value}>
                                                <span style={{ color: status.color }}>{status.label}</span>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item label="Исполнитель" name={`${part.key}ExecutorId`} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="Выберите исполнителя"
                                        size="large"
                                        style={{ width: '100%' }}
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {executors.map(executor => (
                                            <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Flex>
                        </Card>
                    );
                }}
            </Form.Item>
        );
    };

    // Desktop/Tablet Render - Table Layout
    const renderDesktopPart = (part: any) => {
        const isSingle = isSingleQuantity(part.key);

        return (
            <div key={part.key} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev[`${part.key}Quantity`] !== curr[`${part.key}Quantity`]}>
                    {({ getFieldValue }) => {
                        const qty = getFieldValue(`${part.key}Quantity`) || 0;
                        const sum = qty * PRICE_PER_PART;

                        return (
                            <Row gutter={isTablet ? 12 : 16} align="middle">
                                <Col span={isTablet ? 6 : 5}>
                                    <Text strong style={{ fontSize: isTablet ? 13 : 14 }}>{part.label}</Text>
                                    {part.hasLetterCount && (
                                        <div style={{ marginTop: 8 }}>
                                            <Form.Item
                                                name={`${part.key}LetterCount`}
                                                label={<span style={{ fontSize: 12 }}>Букв</span>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumber size={isTablet ? 'middle' : 'middle'} min={0} style={{ width: 70 }} />
                                            </Form.Item>
                                        </div>
                                    )}
                                </Col>

                                {isSingle ? (
                                    <>
                                        <Col span={isTablet ? 4 : 3}>
                                            <Form.Item name={`${part.key}Quantity`} noStyle>
                                                <InputNumber min={0} size={isTablet ? 'middle' : 'large'} style={{ width: '100%' }} placeholder="шт" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={isTablet ? 4 : 3}>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>—</Text>
                                        </Col>
                                    </>
                                ) : (
                                    <>
                                        <Col span={isTablet ? 4 : 3}>
                                            <Form.Item name={`${part.key}Quantity`} noStyle>
                                                <InputNumber min={0} size={isTablet ? 'middle' : 'large'} style={{ width: '100%' }} placeholder="шт" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={isTablet ? 4 : 3}>
                                            <Form.Item name={`${part.key}ActualQuantity`} noStyle>
                                                <InputNumber min={0} size={isTablet ? 'middle' : 'large'} style={{ width: '100%' }} placeholder="шт" />
                                            </Form.Item>
                                        </Col>
                                    </>
                                )}

                                <Col span={isTablet ? 4 : 3}>
                                    <div style={{
                                        padding: '6px 10px',
                                        background: sum > 0 ? '#f6ffed' : '#fafafa',
                                        borderRadius: 6,
                                        border: `2px solid ${sum > 0 ? '#b7eb8f' : '#d9d9d9'}`,
                                        textAlign: 'center'
                                    }}>
                                        <Text strong style={{ color: sum > 0 ? '#389e0d' : '#999', fontSize: isTablet ? 13 : 14 }}>
                                            {sum} ₽
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={isTablet ? 0 : 4}>
                                    <Form.Item name={`${part.key}Status`} noStyle initialValue="pending">
                                        <Select style={{ width: '100%' }} size={isTablet ? 'middle' : 'large'}>
                                            {partStatuses.map(status => (
                                                <Option key={status.value} value={status.value}>
                                                    <span style={{ color: status.color }}>{status.label}</span>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={isTablet ? 6 : 6}>
                                    <Form.Item name={`${part.key}ExecutorId`} noStyle>
                                        <Select
                                            placeholder="Исполнитель"
                                            style={{ width: '100%' }}
                                            size={isTablet ? 'middle' : 'large'}
                                            allowClear
                                            showSearch
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
        );
    };

    return (
        <Card
            type="inner"
            title={
                <Space wrap>
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
            styles={{ header: { background: '#fff7e6', borderBottom: '1px solid #ffd591' } }}
        >
            <div style={{ padding: isMobile ? '0' : '0 8px' }}>
                {!isMobile && (
                    <Row gutter={isTablet ? 12 : 16} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f0f0f0' }}>
                        <Col span={isTablet ? 6 : 5}><Text strong type="secondary">Деталь</Text></Col>
                        <Col span={isTablet ? 4 : 3}><Text strong type="secondary">План/Кол-во</Text></Col>
                        <Col span={isTablet ? 4 : 3}><Text strong type="secondary">Факт</Text></Col>
                        <Col span={isTablet ? 4 : 3}><Text strong type="secondary">Сумма</Text></Col>
                        {!isTablet && <Col span={4}><Text strong type="secondary">Статус</Text></Col>}
                        <Col span={isTablet ? 6 : 6}><Text strong type="secondary">Исполнитель</Text></Col>
                    </Row>
                )}

                <div style={{ maxHeight: isMobile ? 'none' : 500, overflowY: isMobile ? 'visible' : 'auto' }}>
                    {bodyParts.map(part => isMobile ? renderMobilePart(part) : renderDesktopPart(part))}
                </div>

                <div style={{
                    marginTop: 16,
                    textAlign: isMobile ? 'center' : 'right',
                    padding: 12,
                    background: '#fafafa',
                    borderRadius: 8
                }}>
                    <Text type="secondary" style={{ fontSize: isMobile ? 14 : 13 }}>
                        Тариф: {PRICE_PER_PART} ₽ за деталь
                    </Text>
                </div>
            </div>
        </Card>
    );
};

export default BodyPartsBlock;
