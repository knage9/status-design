import React from 'react';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Row,
    Col,
    Typography,
    Space,
    Tag,
} from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface OtherServicesBlockProps {
    executors: any[];
    hasFilm: boolean;
    hasDryCleaning: boolean;
    hasPolishing: boolean;
    hasWheelPainting: boolean;
    hasCarbon: boolean;
}

const OtherServicesBlock: React.FC<OtherServicesBlockProps> = ({
    executors,
    hasFilm,
    hasDryCleaning,
    hasPolishing,
    hasWheelPainting,
    hasCarbon,
}) => {
    if (!hasFilm && !hasDryCleaning && !hasPolishing && !hasWheelPainting && !hasCarbon) {
        return null;
    }

    const renderSection = (title: string, icon: string, color: string, children: React.ReactNode, visible: boolean) => {
        if (!visible) return null;
        return (
            <Card
                size="small"
                title={<Space><span style={{ fontSize: '16px' }}>{icon} {title}</span></Space>}
                style={{
                    marginBottom: 20,
                    borderRadius: 10,
                    borderLeft: `4px solid ${color}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                headStyle={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
            >
                <div style={{ padding: '8px 4px' }}>
                    {children}
                </div>
            </Card>
        );
    };

    return (
        <Card
            type="inner"
            title={
                <Space>
                    <Title level={5} style={{ margin: 0 }}>💼 Регламентные услуги</Title>
                    <Tag color="cyan">Дополнительно</Tag>
                </Space>
            }
            style={{
                marginBottom: 32,
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #91d5ff'
            }}
            headStyle={{ background: '#e6f7ff', borderBottom: '1px solid #91d5ff' }}
        >
            {/* FILM */}
            {renderSection('Плёнка', '🎞️', '#1890ff', (
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item name="filmExecutorId" label="Исполнитель/Бригада">
                            <Select placeholder="Выбрать" allowClear showSearch optionFilterProp="children">
                                {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="filmAmount" label="Сумма к выплате (₽)">
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                parser={value => value!.replace(/\s?|₽/g, '') as unknown as 0}
                                prefix="₽"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            ), hasFilm)}

            {/* DRY CLEANING */}
            {renderSection('Химчистка', '🧽', '#722ed1', (
                <Row gutter={24}>
                    <Col xs={24} md={8}>
                        <Form.Item name="dryCleaningExecutorId" label="Исполнитель">
                            <Select placeholder="Выбрать" allowClear showSearch optionFilterProp="children">
                                {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="dryCleaningServiceAmount" label="Стоимость услуги (₽)">
                            <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="dryCleaningExecutorAmount" label="Выплата исполнителю (₽)">
                            <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                        </Form.Item>
                    </Col>
                </Row>
            ), hasDryCleaning)}

            {/* POLISHING */}
            {renderSection('Покрытие (Полировка/Керамика)', '✨', '#faad14', (
                <Row gutter={24}>
                    <Col xs={24} md={8}>
                        <Form.Item name="polishingExecutorId" label="Исполнитель">
                            <Select placeholder="Выбрать" allowClear showSearch optionFilterProp="children">
                                {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="polishingServiceAmount" label="Стоимость услуги (₽)">
                            <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="polishingExecutorAmount" label="Выплата исполнителю (₽)">
                            <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                        </Form.Item>
                    </Col>
                </Row>
            ), hasPolishing)}

            {/* WHEEL PAINTING */}
            {renderSection('Покраска дисков', '🎡', '#eb2f96', (
                <>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Row gutter={16} align="middle">
                                <Col span={14}>
                                    <Form.Item name="wheelPaintingMountingExecutorId" label="Монтаж / Демонтаж (Кто)">
                                        <Select placeholder="Выбрать" allowClear size="small">
                                            {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={10}>
                                    <Form.Item name="wheelPaintingMountingAmount" label="Сумма">
                                        <InputNumber style={{ width: '100%' }} min={0} size="small" placeholder="₽" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={24} md={12}>
                            <Row gutter={16} align="middle">
                                <Col span={14}>
                                    <Form.Item name="wheelPaintingCapsExecutorId" label="Колпачки (Кто)">
                                        <Select placeholder="Выбрать" allowClear size="small">
                                            {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={10}>
                                    <Form.Item name="wheelPaintingCapsAmount" label="Сумма">
                                        <InputNumber style={{ width: '100%' }} min={0} size="small" placeholder="₽" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={24} style={{ marginTop: 8 }}>
                        <Col xs={24} md={12}>
                            <Form.Item name="wheelPaintingMainExecutorId" label="Основной исполнитель (Покраска)">
                                <Select placeholder="Выбрать" allowClear showSearch>
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="wheelPaintingAmount" label="Общая цена услуги (для клиента)">
                                <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ), hasWheelPainting)}

            {/* CARBON */}
            {renderSection('Карбон', '💎', '#52c41a', (
                <>
                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item name="carbonExecutorId" label="Исполнитель">
                                <Select placeholder="Выбрать" allowClear showSearch optionFilterProp="children">
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="carbonStage" label="Этап">
                                <Select placeholder="Этап">
                                    <Option value="DISMANTLING">Демонтаж</Option>
                                    <Option value="DISASSEMBLY">Разборка</Option>
                                    <Option value="ASSEMBLY">Сборка</Option>
                                    <Option value="MOUNTING">Монтаж</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="carbonType" label="Тип" initialValue="EXTERIOR">
                                <Select>
                                    <Option value="INTERIOR">Интерьер</Option>
                                    <Option value="EXTERIOR">Экстерьер</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="carbonPartsCount" label="Деталей">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item name="carbonPrice" label="Сумма исполнителю (₽)">
                                <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="carbonServiceAmount" label="Стоимость услуги (для клиента)">
                                <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item name="carbonComment" label="Комментарий">
                                <Input.TextArea placeholder="Детали работ по карбону..." rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ), hasCarbon)}
        </Card>
    );
};

export default OtherServicesBlock;
