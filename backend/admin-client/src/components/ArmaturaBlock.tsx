import React from 'react';
import {
    Card,
    Form,
    Select,
    Space,
    Row,
    Col,
    Typography,
    Tag,
    Grid,
    Flex,
} from 'antd';

const { Text, Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

interface ArmaturaBlockProps {
    totalAmount: number;
    executors: any[];
    hasAntichrome: boolean;
}

const ArmaturaBlock: React.FC<ArmaturaBlockProps> = ({ totalAmount, executors, hasAntichrome }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px
    const isTablet = screens.md && !screens.lg; // 768px - 992px

    if (!hasAntichrome) return null;

    const armaturaAmounts = {
        dismantling: totalAmount * 0.07,
        disassembly: totalAmount * 0.03,
        assembly: totalAmount * 0.03,
        mounting: totalAmount * 0.07,
    };

    const renderStageCard = (name: string, label: string, amount: number, percent: string) => (
        <Col xs={24} sm={12} md={12} lg={6}>
            <Card
                size="small"
                style={{
                    borderRadius: 8,
                    border: '2px solid #d9d9d9',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: '100%'
                }}
                styles={{ body: { padding: isMobile ? 16 : 12 } }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ fontSize: isMobile ? 15 : 14 }}>{label}</Text>
                    <Tag color="cyan" style={{ margin: 0, borderRadius: 10, fontSize: isMobile ? 14 : 12 }}>
                        {percent}
                    </Tag>
                </div>

                <Form.Item
                    name={name}
                    style={{ marginBottom: 12 }}
                    label={isMobile ? "Исполнитель" : undefined}
                >
                    <Select
                        placeholder="Исполнитель"
                        style={{ width: '100%' }}
                        size={isMobile ? 'large' : 'middle'}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {executors.map(executor => (
                            <Option key={executor.id} value={executor.id}>
                                {executor.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{
                    padding: isMobile ? '12px 16px' : '10px 12px',
                    background: '#f6ffed',
                    borderRadius: 8,
                    border: '2px solid #b7eb8f',
                    textAlign: 'center'
                }}>
                    <Text strong style={{ color: '#389e0d', fontSize: isMobile ? 18 : 15 }}>
                        {amount.toLocaleString('ru-RU')} ₽
                    </Text>
                </div>
            </Card>
        </Col>
    );

    const renderFixedService = (title: string, removeName: string, installName: string, amount: number) => (
        <Col xs={24} lg={12}>
            <Card
                size="small"
                title={<span style={{ fontSize: isMobile ? 15 : 14 }}>{title}</span>}
                style={{ marginBottom: 16, borderRadius: 8, border: isMobile ? '2px solid #d9d9d9' : '1px solid #d9d9d9' }}
                styles={{
                    header: { background: '#fafafa' },
                    body: { padding: isMobile ? 16 : 12 }
                }}
            >
                {isMobile ? (
                    /* Mobile: Vertical Layout */
                    <Flex vertical gap={12}>
                        <div>
                            <Form.Item label="Снял" name={removeName} style={{ marginBottom: 8 }}>
                                <Select placeholder="Исполнитель" allowClear size="large">
                                    {executors.map(executor => (
                                        <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Tag color="green" style={{ fontSize: 14 }}>+{amount.toLocaleString('ru-RU')} ₽</Tag>
                        </div>
                        <div>
                            <Form.Item label="Поставил" name={installName} style={{ marginBottom: 8 }}>
                                <Select placeholder="Исполнитель" allowClear size="large">
                                    {executors.map(executor => (
                                        <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Tag color="green" style={{ fontSize: 14 }}>+{amount.toLocaleString('ru-RU')} ₽</Tag>
                        </div>
                    </Flex>
                ) : (
                    /* Desktop/Tablet: Horizontal Layout */
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Снял" name={removeName} style={{ marginBottom: 8 }}>
                                <Select placeholder="Исполнитель" allowClear size={isTablet ? 'middle' : 'large'}>
                                    {executors.map(executor => (
                                        <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Tag color="green">+{amount.toLocaleString('ru-RU')} ₽</Tag>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Поставил" name={installName} style={{ marginBottom: 8 }}>
                                <Select placeholder="Исполнитель" allowClear size={isTablet ? 'middle' : 'large'}>
                                    {executors.map(executor => (
                                        <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Tag color="green">+{amount.toLocaleString('ru-RU')} ₽</Tag>
                        </Col>
                    </Row>
                )}
            </Card>
        </Col>
    );

    return (
        <Card
            type="inner"
            title={
                <Space wrap>
                    <Title level={5} style={{ margin: 0 }}>🔧 Работы по арматурке</Title>
                    <Tag color="blue">Антихром</Tag>
                </Space>
            }
            style={{
                marginBottom: 32,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #91d5ff'
            }}
            styles={{ header: { background: '#e6f7ff', borderBottom: '1px solid #91d5ff' } }}
        >
            <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ fontSize: isMobile ? 16 : 15, color: '#003a8c', marginBottom: 16 }}>
                    Основные этапы (процент от суммы заказа)
                </Title>
                <Row gutter={[16, 16]}>
                    {renderStageCard('dismantlingExecutorId', 'Демонтаж', armaturaAmounts.dismantling, '7%')}
                    {renderStageCard('disassemblyExecutorId', 'Разборка', armaturaAmounts.disassembly, '3%')}
                    {renderStageCard('assemblyExecutorId', 'Сборка', armaturaAmounts.assembly, '3%')}
                    {renderStageCard('mountingExecutorId', 'Монтаж', armaturaAmounts.mounting, '7%')}
                </Row>
            </div>

            <Row gutter={24}>
                <Col xs={24} xl={14}>
                    <Title level={5} style={{ fontSize: isMobile ? 16 : 15, color: '#003a8c', marginBottom: 16 }}>
                        Фиксированные услуги
                    </Title>
                    <Row gutter={16}>
                        {renderFixedService('Арматура суппортов', 'brakeCalipersRemovedBy', 'brakeCalipersInstalledBy', 2500)}
                        {renderFixedService('Колёса (снять/поставить)', 'wheelsRemovedBy', 'wheelsInstalledBy', 500)}
                    </Row>
                </Col>

            </Row>
        </Card>
    );
};


export default ArmaturaBlock;
