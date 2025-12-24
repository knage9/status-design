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
import ArmaturaBlock from '../components/ArmaturaBlock';
import BodyPartsBlock from '../components/BodyPartsBlock';
import OtherServicesBlock from '../components/OtherServicesBlock';

const { Option } = Select;
const { Title, Text } = Typography;

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

    // NEW: Загрузка списка исполнителей
    useEffect(() => {
        const loadExecutors = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/users');
                const users = response.data;
                // Фильтруем только EXECUTOR и PAINTER
                const executorsList = users.filter((u: any) =>
                    u.role === 'EXECUTOR' || u.role === 'PAINTER'
                );
                setExecutors(executorsList);
            } catch (error) {
                console.error('Failed to load executors:', error);
            }
        };
        loadExecutors();
    }, []);

    // New state to hold loaded data
    const [requestData, setRequestData] = useState<any>(null);
    // NEW: State для списка услуг и общей суммы
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [executors, setExecutors] = useState<any[]>([]);
    const isExecutor = user?.role === 'EXECUTOR' || user?.role === 'PAINTER';

    useEffect(() => {
        if (isExecutor) {
            notification.error({ message: 'Доступ запрещен' });
            navigate('/work-orders');
        }
    }, [isExecutor, navigate, notification]);

    // Effect to populate form once data is loaded and form is likely mounted
    useEffect(() => {
        if (!initialLoading && requestData) {
            form.setFieldsValue({
                customerName: requestData.name,
                customerPhone: requestData.phone,
                carModel: requestData.carModel,
            });

            // NEW: Извлечь услуги из request
            let services: string[] = [];
            if (requestData.services && requestData.services.length > 0) {
                services = requestData.services;
            } else {
                // Fallback на mainService + additionalServices
                if (requestData.mainService) {
                    services.push(requestData.mainService);
                }
                if (requestData.additionalServices) {
                    services = [...services, ...requestData.additionalServices];
                }
            }
            setSelectedServices(services);
        }
    }, [initialLoading, requestData, form]);

    // NEW: Определяем какие блоки показывать на основе selectedServices
    const hasAntichrome = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('антихром') || lower.includes('antichrome');
    });
    const hasFilm = selectedServices.some(s => s.toLowerCase().includes('плёнка') || s.toLowerCase().includes('пленка') || s.toLowerCase().includes('film'));
    const hasDryCleaning = selectedServices.some(s => s.toLowerCase().includes('химчистка') || s.toLowerCase().includes('dry'));
    const hasPolishing = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('полировка') || lower.includes('керамика') || lower.includes('ceramic') || lower.includes('polishing');
    });
    const hasWheelPainting = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('покраска дисков') || lower.includes('покраска колёс') || lower.includes('покраска колес') || lower.includes('wheel');
    });
    const hasCarbon = selectedServices.some(s => s.toLowerCase().includes('карбон') || s.toLowerCase().includes('carbon'));
    const showBodyParts = hasAntichrome || hasPolishing; // Детали кузова для Антихром и Полировка

    // NEW: Автоматический расчёт ЗП для арматурки при изменении totalAmount
    const armaturaAmounts = {
        dismantling: totalAmount * 0.07,
        disassembly: totalAmount * 0.03,
        assembly: totalAmount * 0.03,
        mounting: totalAmount * 0.07,
    };

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

            // Convert all part quantities to booleans (> 0 = true) - для обратной совместимости
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

            // NEW: Собираем servicesData
            const servicesData: any = {};
            if (values.filmExecutorId) {
                servicesData.film = {
                    executorId: values.filmExecutorId,
                    amount: values.filmAmount || 0,
                };
            }
            if (values.dryCleaningExecutorId) {
                servicesData.dryCleaning = {
                    executorId: values.dryCleaningExecutorId,
                    serviceAmount: values.dryCleaningServiceAmount || 0,
                    executorAmount: values.dryCleaningExecutorAmount || 0,
                };
            }
            if (values.polishingExecutorId) {
                servicesData.polishing = {
                    executorId: values.polishingExecutorId,
                    serviceAmount: values.polishingServiceAmount || 0,
                    executorAmount: values.polishingExecutorAmount || 0,
                };
            }
            if (values.wheelPaintingMainExecutorId || values.wheelPaintingMountingExecutorId || values.wheelPaintingCapsExecutorId) {
                servicesData.wheelPainting = {
                    mainExecutorId: values.wheelPaintingMainExecutorId,
                    amount: values.wheelPaintingAmount || 0,
                    mounting: {
                        executorId: values.wheelPaintingMountingExecutorId,
                        amount: values.wheelPaintingMountingAmount || 0,
                    },
                    caps: {
                        executorId: values.wheelPaintingCapsExecutorId,
                        amount: values.wheelPaintingCapsAmount || 0,
                    }
                };
            }
            if (values.carbonExecutorId) {
                servicesData.carbon = {
                    executorId: values.carbonExecutorId,
                    stage: values.carbonStage || '',
                    type: values.carbonType || 'EXTERIOR',
                    comment: values.carbonComment || '',
                    partsCount: values.carbonPartsCount || 0,
                    price: values.carbonPrice || 0,
                    serviceAmount: values.carbonServiceAmount || 0,
                };
            }

            // NEW: Собираем bodyPartsData (БЕЗ колёс, только для Антихром и Полировки)
            const bodyPartsData: any = {};
            const bodyPartsList = [
                'radiatorGrille', 'fogLights', 'fenders', 'doorHandles',
                'badges', 'inscriptions', 'hubCaps', 'railings'
            ]; // 8 элементов, без колёс

            bodyPartsList.forEach(partKey => {
                const quantity = values[`${partKey}Quantity`];
                const actualQuantity = values[`${partKey}ActualQuantity`];
                const status = values[`${partKey}Status`];
                const executorId = values[`${partKey}ExecutorId`];
                const letterCount = values[`${partKey}LetterCount`]; // для надписей

                if (quantity || actualQuantity || status || executorId) {
                    bodyPartsData[partKey] = {
                        quantity: quantity || 0,
                        actualQuantity: actualQuantity || 0,
                        status: status || 'pending',
                        executorId: executorId || undefined,
                        letterCount: partKey === 'inscriptions' ? letterCount : undefined,
                    };
                }
            });

            // NEW: Собираем armaturaExecutors (только айдишники)
            const armaturaExecutors: any = {};
            if (values.dismantlingExecutorId) armaturaExecutors.dismantling = values.dismantlingExecutorId;
            if (values.disassemblyExecutorId) armaturaExecutors.disassembly = values.disassemblyExecutorId;
            if (values.assemblyExecutorId) armaturaExecutors.assembly = values.assemblyExecutorId;
            if (values.mountingExecutorId) armaturaExecutors.mounting = values.mountingExecutorId;

            // NEW: Собираем fixedServices
            const fixedServices: any = {};
            if (values.brakeCalipersRemovedBy || values.brakeCalipersInstalledBy) {
                fixedServices.brakeCalipers = {
                    removedBy: values.brakeCalipersRemovedBy || undefined,
                    installedBy: values.brakeCalipersInstalledBy || undefined,
                };
            }
            if (values.wheelsRemovedBy || values.wheelsInstalledBy) {
                fixedServices.wheels = {
                    removedBy: values.wheelsRemovedBy || undefined,
                    installedBy: values.wheelsInstalledBy || undefined,
                };
            }

            // NEW: Собираем additionalServices (массив)
            const additionalServices: any[] = [];
            if (values.additionalServices && Array.isArray(values.additionalServices)) {
                values.additionalServices.forEach((service: any) => {
                    if (service.name && service.executorId && service.amount) {
                        additionalServices.push({
                            name: service.name,
                            executorId: service.executorId,
                            amount: service.amount,
                        });
                    }
                });
            }

            const data = {
                requestId: requestId ? parseInt(requestId) : undefined,
                managerId: user?.id || 1,
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

                // Старые поля арматурки (для обратной совместимости)
                dismantling: (Number(values.dismantlingCount) || 0) > 0 || (Number(values.dismantlingPrice) || 0) > 0,
                dismantlingPrice: values.dismantlingPrice ? Number(values.dismantlingPrice) : 0,
                disassembly: (Number(values.disassemblyCount) || 0) > 0 || (Number(values.disassemblyPrice) || 0) > 0,
                disassemblyPrice: values.disassemblyPrice ? Number(values.disassemblyPrice) : 0,
                assembly: (Number(values.assemblyCount) || 0) > 0 || (Number(values.assemblyPrice) || 0) > 0,
                assemblyPrice: values.assemblyPrice ? Number(values.assemblyPrice) : 0,
                mounting: (Number(values.mountingCount) || 0) > 0 || (Number(values.mountingPrice) || 0) > 0,
                mountingPrice: values.mountingPrice ? Number(values.mountingPrice) : 0,

                // Старые поля деталей (для обратной совместимости)
                ...convertedParts,

                // NEW: Новые структуры данных для backend
                servicesData: Object.keys(servicesData).length > 0 ? servicesData : undefined,
                bodyPartsData: Object.keys(bodyPartsData).length > 0 ? bodyPartsData : undefined,
                armaturaExecutors: Object.keys(armaturaExecutors).length > 0 ? armaturaExecutors : undefined,
                fixedServices: Object.keys(fixedServices).length > 0 ? fixedServices : undefined,
                additionalServices: additionalServices.length > 0 ? additionalServices : undefined,
            };

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
                    onValuesChange={(changedValues) => {
                        if (changedValues.totalAmount !== undefined) {
                            // Ensure numeric value is set
                            const amount = typeof changedValues.totalAmount === 'string'
                                ? parseFloat(changedValues.totalAmount.replace(/\s/g, ''))
                                : changedValues.totalAmount;
                            setTotalAmount(amount || 0);
                        }
                    }}
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
                                            parser={value => parseFloat(value!.replace(/\s?|₽/g, '')) || 0}

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
                    <ArmaturaBlock
                        totalAmount={totalAmount}
                        executors={executors}
                        hasAntichrome={hasAntichrome}
                    />

                    <BodyPartsBlock
                        executors={executors}
                        showBodyParts={showBodyParts}
                    />

                    <OtherServicesBlock
                        executors={executors}
                        hasFilm={hasFilm}
                        hasDryCleaning={hasDryCleaning}
                        hasPolishing={hasPolishing}
                        hasWheelPainting={hasWheelPainting}
                        hasCarbon={hasCarbon}
                    />

                    {/* Legacy Body Parts removed as per TZ requirements */}

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
