import React from 'react';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Space,
    Row,
    Col,
    Typography,
    Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

interface ArmaturaBlockProps {
    totalAmount: number;
    executors: any[];
    hasAntichrome: boolean;
}

const ArmaturaBlock: React.FC<ArmaturaBlockProps> = ({ totalAmount, executors, hasAntichrome }) => {
    if (!hasAntichrome) return null;

    const armaturaAmounts = {
        dismantling: totalAmount * 0.07,
        disassembly: totalAmount * 0.03,
        assembly: totalAmount * 0.03,
        mounting: totalAmount * 0.07,
    };

    const renderStageCard = (name: string, label: string, amount: number, percent: string) => (
        <Col xs={24} sm={12} md={6}>
            <Card
                size="small"
                style={{
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    height: '100%'
                }}
                bodyStyle={{ padding: '12px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ fontSize: '13px' }}>{label}</Text>
                    <Tag color="cyan" style={{ margin: 0, borderRadius: 10 }}>{percent}</Tag>
                </div>

                <Form.Item name={name} rules={[{ required: true, message: 'Выберите исполнителя' }]} style={{ marginBottom: 12 }}>
                    <Select
                        placeholder="Исполнитель"
                        style={{ width: '100%' }}
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
                    padding: '8px 12px',
                    background: '#f6ffed',
                    borderRadius: 6,
                    border: '1px solid #b7eb8f',
                    textAlign: 'center'
                }}>
                    <Text strong style={{ color: '#389e0d', fontSize: '15px' }}>
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
                title={<span style={{ fontSize: '14px' }}>{title}</span>}
                style={{ marginBottom: 16, borderRadius: 8 }}
                headStyle={{ background: '#fafafa' }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Снял" name={removeName} style={{ marginBottom: 8 }}>
                            <Select placeholder="Исполнитель" allowClear size="small">
                                {executors.map(executor => (
                                    <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Tag color="green">+{amount.toLocaleString('ru-RU')} ₽</Tag>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Поставил" name={installName} style={{ marginBottom: 8 }}>
                            <Select placeholder="Исполнитель" allowClear size="small">
                                {executors.map(executor => (
                                    <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Tag color="green">+{amount.toLocaleString('ru-RU')} ₽</Tag>
                    </Col>
                </Row>
            </Card>
        </Col>
    );

    return (
        <Card
            type="inner"
            title={
                <Space>
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
            headStyle={{ background: '#e6f7ff', borderBottom: '1px solid #91d5ff' }}
        >
            <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ fontSize: '15px', color: '#003a8c', marginBottom: 16 }}>
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
                    <Title level={5} style={{ fontSize: '15px', color: '#003a8c', marginBottom: 16 }}>Фиксированные услуги</Title>
                    <Row gutter={16}>
                        {renderFixedService('Арматура суппортов', 'brakeCalipersRemovedBy', 'brakeCalipersInstalledBy', 2500)}
                        {renderFixedService('Колёса (снять/поставить)', 'wheelsRemovedBy', 'wheelsInstalledBy', 500)}
                    </Row>
                </Col>

                <Col xs={24} xl={10}>
                    <Title level={5} style={{ fontSize: '15px', color: '#003a8c', marginBottom: 16 }}>Прочее</Title>
                    <Form.List name="additionalServices">
                        {(fields, { add, remove }) => (
                            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 12 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'name']}
                                            rules={[{ required: true, message: 'Название' }]}
                                        >
                                            <Input placeholder="Название" style={{ width: 130 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'executorId']}
                                            rules={[{ required: true, message: 'Кто' }]}
                                        >
                                            <Select placeholder="Кто" style={{ width: 110 }} allowClear>
                                                {executors.map(executor => (
                                                    <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'amount']}
                                            rules={[{ required: true, message: '₽' }]}
                                        >
                                            <InputNumber placeholder="₽" style={{ width: 80 }} min={0} />
                                        </Form.Item>
                                        <Button
                                            type="text"
                                            danger
                                            onClick={() => remove(name)}
                                            icon={<DeleteOutlined />}
                                            size="small"
                                        />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="small">
                                    Добавить работу
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </Col>
            </Row>
        </Card>
    );
};

export default ArmaturaBlock;
