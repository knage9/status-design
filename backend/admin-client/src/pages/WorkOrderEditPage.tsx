import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    FileTextOutlined,
    DollarOutlined,
    UserOutlined,
    CarOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import ArmaturaBlock from '../components/ArmaturaBlock';
import BodyPartsBlock from '../components/BodyPartsBlock';
import OtherServicesBlock from '../components/OtherServicesBlock';

const { Option } = Select;
const { Title, Text } = Typography;

const WorkOrderEditPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { notification } = App.useApp();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [requestData, setRequestData] = useState<any>(null);
    const [workOrderData, setWorkOrderData] = useState<any>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [executors, setExecutors] = useState<any[]>([]);

    const isExecutor = user?.role === 'EXECUTOR' || user?.role === 'PAINTER';

    useEffect(() => {
        if (isExecutor) {
            notification.error({ title: 'Доступ запрещен' });
            navigate('/work-orders');
        }
    }, [isExecutor, navigate, notification]);

    // 1. Fetch Work Order and Request
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Work Order
                const woResponse = await axios.get(`http://localhost:3000/api/work-orders/${id}`);
                const wo = woResponse.data;
                setWorkOrderData(wo);
                setTotalAmount(wo.totalAmount);

                // Fetch Request
                if (wo.requestId) {
                    const reqResponse = await axios.get(`http://localhost:3000/api/requests/${wo.requestId}`);
                    setRequestData(reqResponse.data);
                } else {
                    setRequestData({});
                }

                // Fetch Executors
                const usersResponse = await axios.get('http://localhost:3000/api/users');
                const executorsList = usersResponse.data.filter((u: any) =>
                    u.role === 'EXECUTOR' || u.role === 'PAINTER'
                );
                setExecutors(executorsList);

                setInitialLoading(false);

            } catch (error) {
                console.error('Failed to load data:', error);
                notification.error({ title: 'Ошибка загрузки данных' });
                setInitialLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id]);


    // 2. Populate Services from Request
    useEffect(() => {
        if (!initialLoading && requestData) {
            let services: string[] = [];
            if (requestData.services && requestData.services.length > 0) {
                services = requestData.services;
            } else {
                if (requestData.mainService) services.push(requestData.mainService);
                if (requestData.additionalServices) services = [...services, ...requestData.additionalServices];
            }
            setSelectedServices(services);
        }
    }, [initialLoading, requestData]);

    // 3. Populate Form Fields from Work Order Data
    useEffect(() => {
        if (!initialLoading && workOrderData && form) {
            const wo = workOrderData;

            const initialValues: any = {
                // Main Fields
                totalAmount: wo.totalAmount,
                paymentMethod: wo.paymentMethod,
                customerName: wo.customerName,
                customerPhone: wo.customerPhone,
                carModel: `${wo.carBrand} ${wo.carModel}`.trim(),
                vin: wo.vin,
                carCondition: wo.carCondition,

                // Counts
                blackCount: wo.blackCount,
                carbonCount: wo.carbonCount,
                standardStructureCount: wo.standardStructureCount,

                // Armatura Fixed Services
                brakeCalipersRemovedBy: wo.fixedServices?.brakeCalipers?.removedBy,
                brakeCalipersInstalledBy: wo.fixedServices?.brakeCalipers?.installedBy,
                wheelsRemovedBy: wo.fixedServices?.wheels?.removedBy,
                wheelsInstalledBy: wo.fixedServices?.wheels?.installedBy,

                // Armatura Executors (from armaturaExecutors JSON or flat fields if using compat)
                dismantlingExecutorId: wo.armaturaExecutors?.dismantling,
                disassemblyExecutorId: wo.armaturaExecutors?.disassembly,
                assemblyExecutorId: wo.armaturaExecutors?.assembly,
                mountingExecutorId: wo.armaturaExecutors?.mounting,
            };

            // Body Parts Data
            if (wo.bodyPartsData) {
                Object.entries(wo.bodyPartsData).forEach(([key, data]: [string, any]) => {
                    initialValues[`${key}Quantity`] = data.quantity;
                    initialValues[`${key}ActualQuantity`] = data.actualQuantity;
                    initialValues[`${key}Status`] = data.status;
                    initialValues[`${key}ExecutorId`] = data.executorId;
                    if (data.letterCount) initialValues[`${key}LetterCount`] = data.letterCount;
                });
            }

            // Services Data
            if (wo.servicesData) {
                if (wo.servicesData.film) {
                    initialValues.filmExecutorId = wo.servicesData.film.executorId;
                    initialValues.filmAmount = wo.servicesData.film.amount;
                }
                if (wo.servicesData.dryCleaning) {
                    initialValues.dryCleaningExecutorId = wo.servicesData.dryCleaning.executorId;
                    initialValues.dryCleaningServiceAmount = wo.servicesData.dryCleaning.serviceAmount;
                    initialValues.dryCleaningExecutorAmount = wo.servicesData.dryCleaning.executorAmount;
                }
                if (wo.servicesData.polishing) {
                    initialValues.polishingExecutorId = wo.servicesData.polishing.executorId;
                    initialValues.polishingServiceAmount = wo.servicesData.polishing.serviceAmount;
                    initialValues.polishingExecutorAmount = wo.servicesData.polishing.executorAmount;
                }
                if (wo.servicesData.wheelPainting) {
                    initialValues.wheelPaintingMainExecutorId = wo.servicesData.wheelPainting.mainExecutorId;
                    initialValues.wheelPaintingAmount = wo.servicesData.wheelPainting.amount;
                    if (wo.servicesData.wheelPainting.mounting) {
                        initialValues.wheelPaintingMountingExecutorId = wo.servicesData.wheelPainting.mounting.executorId;
                        initialValues.wheelPaintingMountingAmount = wo.servicesData.wheelPainting.mounting.amount;
                    }
                    if (wo.servicesData.wheelPainting.caps) {
                        initialValues.wheelPaintingCapsExecutorId = wo.servicesData.wheelPainting.caps.executorId;
                        initialValues.wheelPaintingCapsAmount = wo.servicesData.wheelPainting.caps.amount;
                    }
                }
                if (wo.servicesData.carbon) {
                    initialValues.carbonExecutorId = wo.servicesData.carbon.executorId;
                    initialValues.carbonStage = wo.servicesData.carbon.stage;
                    initialValues.carbonType = wo.servicesData.carbon.type;
                    initialValues.carbonComment = wo.servicesData.carbon.comment;
                    initialValues.carbonPartsCount = wo.servicesData.carbon.partsCount;
                    initialValues.carbonPrice = wo.servicesData.carbon.price;
                    initialValues.carbonServiceAmount = wo.servicesData.carbon.serviceAmount;
                }
            }

            // Additional Services
            if (wo.additionalServices) {
                initialValues.additionalServices = wo.additionalServices;
            }

            form.setFieldsValue(initialValues);
        }
    }, [initialLoading, workOrderData, form]);

    // Service Flags
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
    const showBodyParts = hasAntichrome || hasPolishing;

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            // Same logic as Create Page to parse values
            const carParts = values.carModel?.split(' ') || [];
            const carBrand = carParts[0] || 'Не указана';
            const carModel = carParts.slice(1).join(' ') || values.carModel || 'Не указана';

            const totalAmount = typeof values.totalAmount === 'string'
                ? parseFloat(values.totalAmount.replace(/\s/g, ''))
                : values.totalAmount;

            const servicesData: any = {};
            if (values.filmExecutorId) {
                servicesData.film = { executorId: values.filmExecutorId, amount: values.filmAmount || 0 };
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
            if (values.wheelPaintingMainExecutorId) {
                servicesData.wheelPainting = {
                    mainExecutorId: values.wheelPaintingMainExecutorId,
                    amount: values.wheelPaintingAmount || 0,
                    mounting: { executorId: values.wheelPaintingMountingExecutorId, amount: values.wheelPaintingMountingAmount || 0 },
                    caps: { executorId: values.wheelPaintingCapsExecutorId, amount: values.wheelPaintingCapsAmount || 0 }
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

            const bodyPartsData: any = {};
            const bodyPartsList = ['radiatorGrille', 'fogLights', 'fenders', 'doorHandles', 'badges', 'inscriptions', 'hubCaps', 'railings'];
            bodyPartsList.forEach(partKey => {
                const quantity = values[`${partKey}Quantity`];
                const actualQuantity = values[`${partKey}ActualQuantity`];
                const status = values[`${partKey}Status`];
                const executorId = values[`${partKey}ExecutorId`];
                const letterCount = values[`${partKey}LetterCount`];
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

            const armaturaExecutors: any = {};
            if (values.dismantlingExecutorId) armaturaExecutors.dismantling = values.dismantlingExecutorId;
            if (values.disassemblyExecutorId) armaturaExecutors.disassembly = values.disassemblyExecutorId;
            if (values.assemblyExecutorId) armaturaExecutors.assembly = values.assemblyExecutorId;
            if (values.mountingExecutorId) armaturaExecutors.mounting = values.mountingExecutorId;

            const fixedServices: any = {};
            if (values.brakeCalipersRemovedBy || values.brakeCalipersInstalledBy) {
                fixedServices.brakeCalipers = { removedBy: values.brakeCalipersRemovedBy, installedBy: values.brakeCalipersInstalledBy };
            }
            if (values.wheelsRemovedBy || values.wheelsInstalledBy) {
                fixedServices.wheels = { removedBy: values.wheelsRemovedBy, installedBy: values.wheelsInstalledBy };
            }

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
                totalAmount,
                paymentMethod: values.paymentMethod,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                carBrand,
                carModel,
                vin: values.vin,
                carCondition: values.carCondition,
                blackCount: Number(values.blackCount || 0),
                carbonCount: Number(values.carbonCount || 0),
                standardStructureCount: Number(values.standardStructureCount || 0),

                servicesData: Object.keys(servicesData).length > 0 ? servicesData : undefined,
                bodyPartsData: Object.keys(bodyPartsData).length > 0 ? bodyPartsData : undefined,
                armaturaExecutors: Object.keys(armaturaExecutors).length > 0 ? armaturaExecutors : undefined,
                fixedServices: Object.keys(fixedServices).length > 0 ? fixedServices : undefined,
                additionalServices: additionalServices.length > 0 ? additionalServices : undefined,
            };

            await axios.put(`http://localhost:3000/api/work-orders/${id}`, data);

            notification.success({ title: 'Готово!', description: 'Заказ-наряд обновлен' });
            navigate(`/work-orders/${id}`);

        } catch (error: any) {
            console.error('Submit error:', error);
            notification.error({
                title: 'Ошибка сохранения',
                description: error.response?.data?.message || 'Не удалось обновить данные'
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spin size="large" /></div>;

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 24px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/work-orders/${id}`)}
                style={{ marginBottom: 16 }}
                size="large"
            >
                Назад
            </Button>

            <Card
                title={
                    <Space size="middle">
                        <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <Title level={3} style={{ margin: 0 }}>Редактирование заказ-наряда</Title>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={(changedValues) => {
                        if (changedValues.totalAmount !== undefined) {
                            const amount = typeof changedValues.totalAmount === 'string'
                                ? parseFloat(changedValues.totalAmount.replace(/\s/g, ''))
                                : changedValues.totalAmount;
                            setTotalAmount(amount || 0);
                        }
                    }}
                    scrollToFirstError
                >
                    {/* Financial Block */}
                    <Card type="inner" title={<Space><DollarOutlined style={{ color: '#52c41a' }} /><Text strong>Финансовая информация</Text></Space>} style={{ marginBottom: 24, background: 'rgba(82, 196, 26, 0.05)' }}>
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item label={<Text strong>Общая сумма З/Н</Text>} name="totalAmount" rules={[{ required: true }]}>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <InputNumber style={{ width: '100%' }} size="large" min={0}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                            parser={value => (parseFloat(value!.replace(/\s?|₽/g, '')) || 0) as 0}
                                        />
                                        <Button size="large" disabled>₽</Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item label={<Text strong>Форма оплаты</Text>} name="paymentMethod" rules={[{ required: true }]}>
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
                    <Card type="inner" title={<Space><UserOutlined style={{ color: '#1890ff' }} /><Text strong>Информация о клиенте</Text></Space>} style={{ marginBottom: 24, background: 'rgba(24, 144, 255, 0.05)' }}>
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item label={<Text strong>ФИО Заказчика</Text>} name="customerName" rules={[{ required: true }]}>
                                    <Input size="large" prefix={<UserOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item label={<Text strong>Номер телефона</Text>} name="customerPhone" rules={[{ required: true }]}>
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Car Block */}
                    <Card type="inner" title={<Space><CarOutlined style={{ color: '#722ed1' }} /><Text strong>Информация об автомобиле</Text></Space>} style={{ marginBottom: 24, background: 'rgba(114, 46, 209, 0.05)' }}>
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item label={<Text strong>Марка и модель</Text>} name="carModel" rules={[{ required: true }]}>
                                    <Input size="large" prefix={<CarOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item label={<Text strong>VIN номер</Text>} name="vin">
                                    <Input size="large" maxLength={17} />
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
                    <Card type="inner" title={<Space><ToolOutlined style={{ color: '#fa8c16' }} /><Text strong>Типы деталей и покрытий</Text></Space>} style={{ marginBottom: 24, background: 'rgba(250, 140, 22, 0.05)' }}>
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={8}>
                                <Form.Item label={<Text strong>Блэк (черное покрытие)</Text>} name="blackCount">
                                    <InputNumber size="large" style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item label={<Text strong>Карбон</Text>} name="carbonCount">
                                    <InputNumber size="large" style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item label={<Text strong>Штатная структура</Text>} name="standardStructureCount">
                                    <InputNumber size="large" style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

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

                    <div style={{ position: 'sticky', bottom: 0, background: 'var(--ant-color-bg-container)', padding: '16px 0', borderTop: '1px solid var(--ant-color-border)', marginTop: 24, zIndex: 10 }}>
                        <Row gutter={16} justify="end">
                            <Col>
                                <Button size="large" onClick={() => navigate(`/work-orders/${id}`)}>Отмена</Button>
                            </Col>
                            <Col>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} size="large" style={{ minWidth: 200 }}>
                                    Сохранить изменения
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default WorkOrderEditPage;
