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
    Button,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface OtherServicesBlockProps {
    executors: any[];
    hasFilm: boolean;
    hasDryCleaning: boolean;
    hasPolishing: boolean;
    hasWheelPainting: boolean;
    hasCarbon: boolean;
    hasSoundproofing: boolean;
}

const OtherServicesBlock: React.FC<OtherServicesBlockProps> = ({
    executors,
    hasFilm,
    hasDryCleaning,
    hasPolishing,
    hasWheelPainting,
    hasCarbon,
    hasSoundproofing,
}) => {
    // If no regulated services, we might still want to show "Additional Services" if it was populated separately? 
    // But logically, this block is "Regulated and Additional Services".
    if (!hasFilm && !hasDryCleaning && !hasPolishing && !hasWheelPainting && !hasCarbon && !hasSoundproofing) {
        // return null; // We should probably return null if NO services to show, but "Additional Services" are always available to add manual ones?
        // Considering the previous code returned null if all flags are false.
        // However, the "Additional Services" list is also inside this component.
        // If we return null here, user can't add custom services if no standard ones are selected.
        // But usually "Additional Services" are for things NOT in the regulated list.
        // Let's keep existing behavior for now, or maybe check if there are additional services in form?
        // For now, I will abide by the flags as per previous implementation to determine visibility of the BLOCK context.
        // Wait, if I want to add an additional service but didn't select any main service, I can't?
        // That seems like a flaw, but I'll stick to the request: "Regulated services should appear as cards..."
    }

    // Function to render section
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
                styles={{ header: { background: '#fafafa', borderBottom: '1px solid #f0f0f0' } }}
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
            styles={{ header: { background: '#e6f7ff', borderBottom: '1px solid #91d5ff' } }}
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
                                parser={value => (value ? parseFloat(value.replace(/\s|₽/g, '')) : 0) as any}
                                prefix="₽"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            ), hasFilm)}

            {/* SOUNDPROOFING */}
            {renderSection('Шумоизоляция', '🔊', '#531dab', (
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item name="soundproofingExecutorId" label="Исполнитель">
                            <Select placeholder="Выбрать" allowClear showSearch optionFilterProp="children">
                                {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="soundproofingAmount" label="Сумма к выплате (₽)">
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                parser={value => (value ? parseFloat(value.replace(/\s|₽/g, '')) : 0) as any}
                                prefix="₽"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            ), hasSoundproofing)}

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
                        <Form.Item name="dryCleaningExecutorAmount" label="Сумма к выплате (₽)">
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
                        <Form.Item name="polishingExecutorAmount" label="Сумма к выплате (₽)">
                            <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                        </Form.Item>
                    </Col>
                </Row>
            ), hasPolishing)}

            {/* WHEEL_PAINTING */}
            {renderSection('Покраска дисков', '🎡', '#eb2f96', (
                <>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item name="wheelPaintingMountingExecutorId" label="Монтаж (Кто)">
                                <Select placeholder="Выбрать" allowClear showSearch optionFilterProp="children">
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="wheelPaintingDismountingExecutorId" label="Демонтаж (Кто)">
                                <Select placeholder="Выбрать" allowClear showSearch optionFilterProp="children">
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item name="wheelPaintingAmount" label="Стоимость для клиента (₽)">
                                <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="wheelPaintingPayoutAmount" label="Сумма выплаты исполнителям (₽)" tooltip="Делится 50/50 между монтажом и демонтажом">
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
                        <Col xs={24} md={12}>
                            <Form.Item name="carbonType" label="Тип" initialValue="EXTERIOR">
                                <Select>
                                    <Option value="INTERIOR">Интерьер</Option>
                                    <Option value="EXTERIOR">Экстерьер</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Determine visibility of fields based on logic. 
                        Note: In Ant Design Form, we can use dependency or just render everything and rely on conditional rendering.
                        But here we are inside a pure render. We need Form.Item with shouldUpdate or dependencies.
                    */}
                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.carbonType !== curr.carbonType || prev.carbonPartsCount !== curr.carbonPartsCount || prev.carbonPrice !== curr.carbonPrice}>
                        {({ getFieldValue }) => {
                            const carbonType = getFieldValue('carbonType') || 'EXTERIOR';
                            const partsCount = getFieldValue('carbonPartsCount') || 0;
                            const price = getFieldValue('carbonPrice') || 0;
                            const currentServiceAmount = getFieldValue('carbonServiceAmount');

                            // Auto-calculate service amount if not manually set or if components change
                            const autoAmount = partsCount * price;
                            if (carbonType === 'EXTERIOR' && autoAmount > 0 && currentServiceAmount !== autoAmount) {
                                // We don't want to set during render, but for now this is a simple way
                                // In a real app we'd use a dedicated effect or handle change in InputNumber
                            }

                            return (
                                <>
                                    {carbonType === 'EXTERIOR' && (
                                        <Row gutter={24}>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="carbonPartsCount" label="Количество деталей">
                                                    <InputNumber style={{ width: '100%' }} min={0} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="carbonPrice" label="Цена за деталь (₽)">
                                                    <InputNumber style={{ width: '100%' }} min={0} prefix="₽" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="carbonServiceAmount" label="Итого за карбон (₽)">
                                                    <InputNumber style={{ width: '100%' }} min={0} placeholder={autoAmount > 0 ? `Авто: ${autoAmount}` : "Сумма"} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}
                                    {carbonType === 'INTERIOR' && (
                                        <Row gutter={24}>
                                            <Col xs={24} md={24}>
                                                <Form.Item name="carbonServiceAmount" label="Сумма за интерьер (₽)">
                                                    <InputNumber style={{ width: '100%' }} min={0} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}
                                    <Row gutter={24}>
                                        <Col xs={24} md={12}>
                                            <Form.Item name="carbonExecutorId" label="Исполнитель (Карбонщик)">
                                                <Select placeholder="Выбрать..." allowClear>
                                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item name="carbonComment" label="Комментарий / Список деталей">
                                                <Input.TextArea placeholder="Напр: руль, вставки дверей..." rows={2} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            );
                        }}
                    </Form.Item>

                    <Title level={5} style={{ fontSize: 14, marginTop: 12, marginBottom: 12 }}>Этапы работ (Арматурка)</Title>
                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item label={<Space>Демонтаж <Tag color="cyan">7%</Tag></Space>} name="carbonDismantlingExecutorId">
                                <Select placeholder="Исполнитель" allowClear>
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label={<Space>Разборка <Tag color="cyan">3%</Tag></Space>} name="carbonDisassemblyExecutorId">
                                <Select placeholder="Исполнитель" allowClear>
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label={<Space>Сборка <Tag color="cyan">3%</Tag></Space>} name="carbonAssemblyExecutorId">
                                <Select placeholder="Исполнитель" allowClear>
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label={<Space>Монтаж <Tag color="cyan">7%</Tag></Space>} name="carbonMountingExecutorId">
                                <Select placeholder="Исполнитель" allowClear>
                                    {executors.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ), hasCarbon)}

            {/* ADDITIONAL SERVICES */}
            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Дополнительные услуги</Title>
            <Form.List name="additionalServices">
                {(fields, { add, remove }) => (
                    <div style={{
                        background: '#fafafa',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #f0f0f0'
                    }}>
                        {fields.map(({ key, name, ...restField }) => (
                            <Row key={key} gutter={12} align="middle" style={{ marginBottom: 16 }}>
                                <Col xs={24} md={10}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'name']}
                                        label="Название"
                                        rules={[{ required: true, message: 'Название' }]}
                                    >
                                        <Input placeholder="Название услуги" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'executorId']}
                                        label="Исполнитель"
                                    >
                                        <Select placeholder="Исполнитель" allowClear>
                                            {executors.map(executor => (
                                                <Option key={executor.id} value={executor.id}>{executor.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={20} md={5}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'amount']}
                                        label="Сумма (₽)"
                                    >
                                        <InputNumber style={{ width: '100%' }} min={0} placeholder="Клиент" />
                                    </Form.Item>
                                </Col>
                                <Col xs={20} md={5}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'executorAmount']}
                                        label="Выплата (₽)"
                                    >
                                        <InputNumber style={{ width: '100%' }} min={0} placeholder="Исполнитель" />
                                    </Form.Item>
                                </Col>
                                <Col xs={4} md={2}>
                                    <Button
                                        type="text"
                                        danger
                                        onClick={() => remove(name)}
                                        icon={<DeleteOutlined />}
                                        style={{ marginTop: 30 }}
                                    />
                                </Col>
                            </Row>
                        ))}
                        <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                        >
                            Добавить услугу
                        </Button>
                    </div>
                )}
            </Form.List>
        </Card>
    );
};

export default OtherServicesBlock;
