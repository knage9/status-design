import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Space,
    Divider,
    Row,
    Col,
    App,
    Spin,
    Typography,
    Tooltip,
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    FileTextOutlined,
    DollarOutlined,
    UserOutlined,
    CarOutlined,
    ToolOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const { Option } = Select;
const { Title, Text } = Typography;

interface PartField {
    name: string;
    label: string;
}

const WorkOrderCreatePage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { notification } = App.useApp();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const requestId = searchParams.get('requestId');

    useEffect(() => {
        const loadRequestData = async () => {
            if (requestId) {
                try {
                    const response = await axios.get(`http://localhost:3000/api/requests/${requestId}`);
                    const request = response.data;

                    // Set loading to false FIRST so the form mounts
                    setInitialLoading(false);

                    // Then set the values (need a small timeout or use the callback of setState if it were class component, 
                    // but here we can just wait for next tick or rely on React 18 batching, 
                    // actually safer to use a separate useEffect or just set it here and hope the form instance is ready.
                    // Since we are in the same render cycle, if we set loading false, the return below will render the Form.
                    // However, useForm instance is constant. The issue is setFieldsValue works on the internal store.
                    // If the Form is not connected, it warns. 
                    // The Form connects when it mounts.
                    // So we must wait for the render.

                    // Better approach: Store data in state and use a separate useEffect.
                    setRequestData(request);
                } catch (error) {
                    console.error('Failed to load request:', error);
                    setInitialLoading(false);
                }
            } else {
                setInitialLoading(false);
            }
        };

        loadRequestData();
    }, [requestId]);

    // New state to hold loaded data
    const [requestData, setRequestData] = useState<any>(null);

    // Effect to populate form once data is loaded and form is likely mounted
    useEffect(() => {
        if (!initialLoading && requestData) {
            form.setFieldsValue({
                customerName: requestData.name,
                customerPhone: requestData.phone,
                carModel: requestData.carModel,
            });
        }
    }, [initialLoading, requestData, form]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const carParts = values.carModel?.split(' ') || [];
            const carBrand = carParts[0] || 'Не указана';
            const carModel = carParts.slice(1).join(' ') || values.carModel || 'Не указана';

            // Parse totalAmount - remove spaces and convert to number
            const totalAmount = typeof values.totalAmount === 'string'
                ? parseFloat(values.totalAmount.replace(/\s/g, ''))
                : values.totalAmount;

            // Convert all part quantities to booleans (> 0 = true)
            const partFields = [
                'radiatorGrille', 'fogLights', 'frontBumper', 'lip', 'hood',
                'windowMoldings', 'doorMoldings', 'vents', 'fenders', 'doorHandles', 'mirrors',
                'trunkLid', 'spoiler', 'rearBumper', 'diffuser', 'rearLights', 'fakeExhausts',
                'badges', 'inscriptions', 'hubCaps', 'railings', 'sills', 'wheels', 'nozzles',
            ];

            const convertedParts: any = {};
            partFields.forEach(field => {
                const value = values[field];
                convertedParts[field] = value != null && value > 0;
            });

            const data = {
                requestId: requestId ? parseInt(requestId) : undefined,
                managerId: user?.id || 1, // Fallback to 1 if user not loaded
                totalAmount,
                paymentMethod: values.paymentMethod,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                carBrand,
                carModel,
                vin: values.vin || undefined,
                carCondition: values.carCondition,
                blackCount: values.blackCount ? Number(values.blackCount) : 0,
                carbonCount: values.carbonCount ? Number(values.carbonCount) : 0,
                standardStructureCount: values.standardStructureCount ? Number(values.standardStructureCount) : 0,
                // Armouring - backend has boolean + price (no count fields)
                dismantling: (Number(values.dismantlingCount) || 0) > 0 || (Number(values.dismantlingPrice) || 0) > 0,
                dismantlingPrice: values.dismantlingPrice ? Number(values.dismantlingPrice) : 0,
                disassembly: (Number(values.disassemblyCount) || 0) > 0 || (Number(values.disassemblyPrice) || 0) > 0,
                disassemblyPrice: values.disassemblyPrice ? Number(values.disassemblyPrice) : 0,
                assembly: (Number(values.assemblyCount) || 0) > 0 || (Number(values.assemblyPrice) || 0) > 0,
                assemblyPrice: values.assemblyPrice ? Number(values.assemblyPrice) : 0,
                mounting: (Number(values.mountingCount) || 0) > 0 || (Number(values.mountingPrice) || 0) > 0,
                mountingPrice: values.mountingPrice ? Number(values.mountingPrice) : 0,
                // Parts as booleans
                ...convertedParts,
            };

            console.log('Submitting data:', data);

            await axios.post('http://localhost:3000/api/work-orders', data);
            notification.success({
                title: 'Готово!',
                description: 'Заказ-наряд успешно создан',
                duration: 3,
            });

            if (requestId) {
                navigate(`/requests/${requestId}`);
            } else {
                navigate('/work-orders');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            notification.error({
                title: 'Ошибка создания',
                description: error.response?.data?.message || 'Проверьте заполнение обязательных полей',
                duration: 5,
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    const frontParts: PartField[] = [
        { name: 'radiatorGrille', label: 'Решетка радиатора' },
        { name: 'fogLights', label: 'ПТФ (противотуманки)' },
        { name: 'frontBumper', label: 'Передний бампер' },
        { name: 'lip', label: 'Губа' },
        { name: 'hood', label: 'Капот' },
    ];

    const sideParts: PartField[] = [
        { name: 'windowMoldings', label: 'Оконные молдинги' },
        { name: 'doorMoldings', label: 'Дверные молдинги' },
        { name: 'vents', label: 'Форточки' },
        { name: 'fenders', label: 'Крылья' },
        { name: 'doorHandles', label: 'Ручки дверей' },
        { name: 'mirrors', label: 'Зеркала' },
    ];

    const rearParts: PartField[] = [
        { name: 'trunkLid', label: 'Крышка багажника' },
        { name: 'spoiler', label: 'Спойлер' },
        { name: 'rearBumper', label: 'Задний бампер' },
        { name: 'diffuser', label: 'Диффузор' },
        { name: 'rearLights', label: 'Задние фонари' },
        { name: 'fakeExhausts', label: 'Фальшь насадки' },
    ];

    const otherParts: PartField[] = [
        { name: 'badges', label: 'Значки' },
        { name: 'inscriptions', label: 'Надписи' },
        { name: 'hubCaps', label: 'Ступичные колпачки' },
        { name: 'railings', label: 'Рейлинги' },
        { name: 'sills', label: 'Пороги' },
        { name: 'wheels', label: 'Колеса' },
        { name: 'nozzles', label: 'Насадки' },
    ];

    const renderPartInputs = (parts: PartField[], gridCols: { xs: number; sm: number; md: number; lg: number }) => {
        return parts.map(part => (
            <Col {...gridCols} key={part.name}>
                <Form.Item
                    label={part.label}
                    name={part.name}
                    style={{ marginBottom: 16 }}
                >
                    <Space.Compact style={{ width: '100%' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            size="large"
                            min={0}
                            max={999}
                            placeholder="0 шт"
                        />
                    </Space.Compact>
                </Form.Item>
            </Col>
        ));
    };

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 24px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => requestId ? navigate(`/requests/${requestId}`) : navigate('/work-orders')}
                style={{ marginBottom: 16 }}
                size="large"
            >
                Назад
            </Button>

            <Card
                title={
                    <Space size="middle">
                        <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <Title level={3} style={{ margin: 0 }}>Новый заказ-наряд</Title>
                    </Space>
                }
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        totalAmount: 0,
                        paymentMethod: 'CASH',
                        carCondition: 'USED',
                        blackCount: 0,
                        carbonCount: 0,
                        standardStructureCount: 0,
                        dismantlingCount: 0,
                        dismantlingPrice: 0,
                        disassemblyCount: 0,
                        disassemblyPrice: 0,
                        assemblyCount: 0,
                        assemblyPrice: 0,
                        mountingCount: 0,
                        mountingPrice: 0,
                    }}
                    scrollToFirstError
                >
                    {/* Financial Block */}
                    <Card
                        type="inner"
                        title={
                            <Space>
                                <DollarOutlined style={{ color: '#52c41a' }} />
                                <Text strong>Финансовая информация</Text>
                            </Space>
                        }
                        style={{ marginBottom: 24, background: 'rgba(82, 196, 26, 0.05)' }}
                    >
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item
                                    label={<Text strong>Общая сумма З/Н</Text>}
                                    name="totalAmount"
                                    rules={[{ required: true, message: 'Укажите сумму' }]}
                                    tooltip="Итоговая стоимость работ и материалов"
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            size="large"
                                            min={0}
                                            placeholder="0"
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                        />
                                        <Button size="large" disabled>₽</Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item
                                    label={<Text strong>Форма оплаты</Text>}
                                    name="paymentMethod"
                                    rules={[{ required: true }]}
                                >
                                    <Select size="large">
                                        <Option value="CASH">💵 Наличные</Option>
                                        <Option value="NON_CASH">💳 Безналичные</Option>
                                        <Option value="WITHOUT_VAT">📋 Без НДС</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Customer Block */}
                    <Card
                        type="inner"
                        title={
                            <Space>
                                <UserOutlined style={{ color: '#1890ff' }} />
                                <Text strong>Информация о клиенте</Text>
                            </Space>
                        }
                        style={{ marginBottom: 24, background: 'rgba(24, 144, 255, 0.05)' }}
                    >
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item
                                    label={<Text strong>ФИО Заказчика</Text>}
                                    name="customerName"
                                    rules={[{ required: true, message: 'Укажите имя' }]}
                                >
                                    <Input size="large" placeholder="Иван Иванович Иванов" prefix={<UserOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item
                                    label={<Text strong>Номер телефона</Text>}
                                    name="customerPhone"
                                    rules={[{ required: true, message: 'Укажите телефон' }]}
                                >
                                    <Input size="large" placeholder="+7 (999) 123-45-67" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Car Block */}
                    <Card
                        type="inner"
                        title={
                            <Space>
                                <CarOutlined style={{ color: '#722ed1' }} />
                                <Text strong>Информация об автомобиле</Text>
                            </Space>
                        }
                        style={{ marginBottom: 24, background: 'rgba(114, 46, 209, 0.05)' }}
                    >
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item
                                    label={<Text strong>Марка и модель</Text>}
                                    name="carModel"
                                    rules={[{ required: true, message: 'Укажите автомобиль' }]}
                                >
                                    <Input size="large" placeholder="Toyota Camry" prefix={<CarOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item
                                    label={
                                        <Space>
                                            <Text strong>VIN номер</Text>
                                            <Tooltip title="17-значный идентификационный номер">
                                                <QuestionCircleOutlined />
                                            </Tooltip>
                                        </Space>
                                    }
                                    name="vin"
                                >
                                    <Input size="large" placeholder="1HGBH41JXMN109186" maxLength={17} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item label={<Text strong>Состояние авто</Text>} name="carCondition">
                                    <Select size="large">
                                        <Option value="NEW">🆕 Новая</Option>
                                        <Option value="USED">🚗 С пробегом</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Parts Count */}
                    <Card
                        type="inner"
                        title={
                            <Space>
                                <ToolOutlined style={{ color: '#fa8c16' }} />
                                <Text strong>Типы деталей и покрытий</Text>
                            </Space>
                        }
                        style={{ marginBottom: 24, background: 'rgba(250, 140, 22, 0.05)' }}
                    >
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={8}>
                                <Form.Item label={<Text strong>Блэк (черное покрытие)</Text>} name="blackCount">
                                    <Space.Compact style={{ width: '100%' }}>
                                        <InputNumber size="large" style={{ width: '100%' }} min={0} />
                                        <Button size="large" disabled>шт</Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item label={<Text strong>Карбон</Text>} name="carbonCount">
                                    <Space.Compact style={{ width: '100%' }}>
                                        <InputNumber size="large" style={{ width: '100%' }} min={0} />
                                        <Button size="large" disabled>шт</Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item label={<Text strong>Штатная структура</Text>} name="standardStructureCount">
                                    <Space.Compact style={{ width: '100%' }}>
                                        <InputNumber size="large" style={{ width: '100%' }} min={0} />
                                        <Button size="large" disabled>шт</Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Armouring */}
                    <Card
                        type="inner"
                        title={<Text strong>🔧 Работы по арматурке (количество и цена)</Text>}
                        style={{ marginBottom: 24 }}
                    >
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Демонтаж</Text>
                                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                                    <Form.Item name="dismantlingCount" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Кол-во" />
                                            <Button size="large" disabled>шт</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                    <Form.Item name="dismantlingPrice" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Цена" />
                                            <Button size="large" disabled>₽</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Разборка</Text>
                                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                                    <Form.Item name="disassemblyCount" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Кол-во" />
                                            <Button size="large" disabled>шт</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                    <Form.Item name="disassemblyPrice" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Цена" />
                                            <Button size="large" disabled>₽</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Сборка</Text>
                                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                                    <Form.Item name="assemblyCount" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Кол-во" />
                                            <Button size="large" disabled>шт</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                    <Form.Item name="assemblyPrice" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Цена" />
                                            <Button size="large" disabled>₽</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Монтаж</Text>
                                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                                    <Form.Item name="mountingCount" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Кол-во" />
                                            <Button size="large" disabled>шт</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                    <Form.Item name="mountingPrice" noStyle>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Цена" />
                                            <Button size="large" disabled>₽</Button>
                                        </Space.Compact>
                                    </Form.Item>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    <Divider titlePlacement="left" style={{ fontSize: 18, fontWeight: 600, marginTop: 40 }}>
                        🚗 Детали автомобиля (укажите количество)
                    </Divider>

                    {/* Front Parts */}
                    <Card
                        type="inner"
                        title={<Text strong style={{ fontSize: 16 }}>Передняя часть</Text>}
                        style={{ marginBottom: 16 }}
                    >
                        <Row gutter={[16, 8]}>
                            {renderPartInputs(frontParts, { xs: 24, sm: 12, md: 8, lg: 6 })}
                        </Row>
                    </Card>

                    {/* Side Parts */}
                    <Card
                        type="inner"
                        title={<Text strong style={{ fontSize: 16 }}>Боковая часть</Text>}
                        style={{ marginBottom: 16 }}
                    >
                        <Row gutter={[16, 8]}>
                            {renderPartInputs(sideParts, { xs: 24, sm: 12, md: 8, lg: 6 })}
                        </Row>
                    </Card>

                    {/* Rear Parts */}
                    <Card
                        type="inner"
                        title={<Text strong style={{ fontSize: 16 }}>Задняя часть</Text>}
                        style={{ marginBottom: 16 }}
                    >
                        <Row gutter={[16, 8]}>
                            {renderPartInputs(rearParts, { xs: 24, sm: 12, md: 8, lg: 6 })}
                        </Row>
                    </Card>

                    {/* Other Parts */}
                    <Card
                        type="inner"
                        title={<Text strong style={{ fontSize: 16 }}>Другие элементы</Text>}
                        style={{ marginBottom: 32 }}
                    >
                        <Row gutter={[16, 8]}>
                            {renderPartInputs(otherParts, { xs: 24, sm: 12, md: 8, lg: 6 })}
                        </Row>
                    </Card>

                    {/* Submit Button */}
                    <div
                        style={{
                            position: 'sticky',
                            bottom: 0,
                            background: 'var(--ant-color-bg-container)',
                            padding: '16px 0',
                            borderTop: '1px solid var(--ant-color-border)',
                            marginTop: 24,
                            zIndex: 10,
                        }}
                    >
                        <Row gutter={16} justify="end">
                            <Col>
                                <Button
                                    size="large"
                                    onClick={() => requestId ? navigate(`/requests/${requestId}`) : navigate('/work-orders')}
                                >
                                    Отмена
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    icon={<SaveOutlined />}
                                    size="large"
                                    style={{ minWidth: 200 }}
                                >
                                    {loading ? 'Создание...' : 'Создать заказ-наряд'}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default WorkOrderCreatePage;
