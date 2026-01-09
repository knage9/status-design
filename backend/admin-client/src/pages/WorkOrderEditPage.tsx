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
    QuestionCircleOutlined,
    InfoCircleOutlined,
    PrinterOutlined,
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
    const [isInitialized, setIsInitialized] = useState(false);





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
                const woResponse = await axios.get(`/api/work-orders/${id}`);
                const wo = woResponse.data;
                setWorkOrderData(wo);
                setTotalAmount(wo.totalAmount);

                // Fetch Request
                if (wo.requestId) {
                    const reqResponse = await axios.get(`/api/requests/${wo.requestId}`);
                    setRequestData(reqResponse.data);
                } else {
                    setRequestData({});
                }

                // Fetch Executors
                const usersResponse = await axios.get('/api/users');
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

            // Pre-fill additional services if empty in Work Order
            // Pre-fill additional services if empty in Work Order
            const currentAdditional = form.getFieldValue('additionalServices');
            // If the WO already has additional services, use them. 
            // BUT we must filter out any that are actually regulated services if they were saved incorrectly before.
            // AND if the WO was just created and additional services came from Request, we must also filter.
            // The logic: 
            // 1. If wo.additionalServices exists, it's the source of truth. Filter it.
            // 2. If it's empty, and we have requestData.additionalServices, use those (filtered).

            // Wait, we are in the "Populate from Request" effect. This runs if requestData changes. 
            // But we already populated form from WorkOrderData in the other effect (line 201).
            // Line 112 checking `form.getFieldValue` might be checking what was just set by line 292? 
            // Or this effect runs first?
            // "loadData" sets workOrderData -> Effect 201 runs -> Sets Form.
            // "loadData" sets requestData -> Effect 100 runs -> Checks form.

            // To be safe, let's just ensure we don't duplicate logic. 
            // The Effect 201 (loading WO data) sets `additionalServices`.
            // This Effect 100 (loading Request data) tries to fill gaps.

            // The issue User reports: "Regulated services appear in Additional Services list".
            // This means when we load `wo.additionalServices`, it currently contains "Film", "Cleaning", etc.
            // So we MUST filter `wo.additionalServices` in Effect 201 AND `requestData.additionalServices` in Effect 100.

            const knownKeywords = ['антихром', 'antichrome', 'плёнка', 'пленка', 'film', 'antigravity',
                'химчистка', 'dry', 'cleaning', 'полировка', 'керамика', 'ceramic', 'polish',
                'покраска дисков', 'покраска колёс', 'покраска колес', 'wheel', 'disk',
                'карбон', 'carbon', 'шумоизоляция', 'soundproofing', 'noise'];

            const isRegulated = (name: string) => {
                const lower = name.toLowerCase();
                return knownKeywords.some(k => lower.includes(k));
            };

            // This block handles Request Data backfill. 
            if ((!currentAdditional || currentAdditional.length === 0) && requestData.additionalServices && requestData.additionalServices.length > 0) {
                const properAdditional = requestData.additionalServices.filter((s: string) => !isRegulated(s));
                if (properAdditional.length > 0) {
                    const mappedServices = properAdditional.map((s: string) => ({
                        name: s,
                        amount: 0,
                        executorAmount: 0 // Initialize executor amount
                    }));
                    form.setFieldsValue({ additionalServices: mappedServices });
                }
            }
        }
    }, [initialLoading, requestData, form]);

    // Calculation Logic
    const calculateTotal = (values: any) => {
        let total = 0;

        // Dynamic Services
        total += Number(values.filmAmount || 0);
        total += Number(values.dryCleaningServiceAmount || 0); // Service Amount (Client Price)
        total += Number(values.polishingServiceAmount || 0); // Service Amount
        total += Number(values.wheelPaintingAmount || 0);
        total += Number(values.carbonServiceAmount || 0);
        total += Number(values.soundproofingAmount || 0);

        // Additional Services
        if (values.additionalServices && Array.isArray(values.additionalServices)) {
            values.additionalServices.forEach((s: any) => {
                total += Number(s?.amount || 0);
            });
        }

        // Fixed Services (Armatura) - If needed. Currently they don't seem to have a "Price for Client" field separate from "Amount for Executor" 
        // EXCEPT cleaningExecutorAmount vs cleaningPrice. 
        // ArmaturaBlock shows percentages of Total Amount. 
        // If there are manual "Fixed Services" like "Brake Calipers" (2500) and "Wheels" (500), do they add to total?
        // In ArmaturaBlock, they are rendered with specific amounts (2500, 500). 
        // The prompt says "Calculation of total amount from services". 
        // If these are Fixed Services, maybe they should be added? 
        // But ArmaturaBlock logic says they are "Fixed Services". 
        // I will add them if they are selected?
        // Actually, the ArmaturaBlock logic uses `removedBy`/`installedBy`. 
        // If I select someone, does the price increase? 
        // Usually fixed prices are charged to client. 
        // I will add them: 
        if (values.brakeCalipersRemovedBy || values.brakeCalipersInstalledBy) total += 2500;
        if (values.wheelsRemovedBy || values.wheelsInstalledBy) total += 500;

        return total;
    };

    // Watch for changes to auto-calculate
    const handleFormChange = (changedValues: any, allValues: any) => {
        // List of fields that affect total
        const affectTotal = [
            'filmAmount',
            'dryCleaningServiceAmount',
            'polishingServiceAmount',
            'wheelPaintingAmount',
            'carbonServiceAmount',
            'carbonPrice', 'carbonPartsCount',
            'soundproofingAmount',
            'additionalServices',
            'brakeCalipersRemovedBy', 'brakeCalipersInstalledBy',
            'wheelsRemovedBy', 'wheelsInstalledBy'
        ];

        const shouldRecalculate = isInitialized && Object.keys(changedValues).some(key =>
            affectTotal.includes(key) || key.startsWith('additionalServices')
        );

        if (shouldRecalculate) {
            const newTotal = calculateTotal(allValues);
            // Only update if different to avoid loops, and maybe only if > 0
            if (newTotal !== allValues.totalAmount) {
                form.setFieldsValue({ totalAmount: newTotal });
                setTotalAmount(newTotal);
            }
        }

        // Also update local state for Armatura percentages
        if (changedValues.totalAmount !== undefined) {
            const amount = typeof changedValues.totalAmount === 'string'
                ? parseFloat(changedValues.totalAmount.replace(/\s/g, ''))
                : changedValues.totalAmount;
            setTotalAmount(amount || 0);
        }
    };

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
                dismantlingExecutorId: wo.armaturaExecutors?.dismantling?.executorId ?? wo.armaturaExecutors?.dismantling,
                disassemblyExecutorId: wo.armaturaExecutors?.disassembly?.executorId ?? wo.armaturaExecutors?.disassembly,
                assemblyExecutorId: wo.armaturaExecutors?.assembly?.executorId ?? wo.armaturaExecutors?.assembly,
                mountingExecutorId: wo.armaturaExecutors?.mounting?.executorId ?? wo.armaturaExecutors?.mounting,
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
                if (wo.servicesData.soundproofing) {
                    initialValues.soundproofingExecutorId = wo.servicesData.soundproofing.executorId;
                    initialValues.soundproofingAmount = wo.servicesData.soundproofing.amount;
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
                if (wo.servicesData.carbon) {
                    initialValues.carbonExecutorId = wo.servicesData.carbon.executorId;
                    initialValues.carbonStage = wo.servicesData.carbon.stage;
                    initialValues.carbonType = wo.servicesData.carbon.type;
                    initialValues.carbonComment = wo.servicesData.carbon.comment;
                    initialValues.carbonPartsCount = wo.servicesData.carbon.partsCount;
                    initialValues.carbonPrice = wo.servicesData.carbon.price;
                    initialValues.carbonServiceAmount = wo.servicesData.carbon.serviceAmount;
                    // Restore Carbon Armatura
                    initialValues.carbonDismantlingExecutorId = wo.servicesData.carbon.dismantlingExecutorId;
                    initialValues.carbonDisassemblyExecutorId = wo.servicesData.carbon.disassemblyExecutorId;
                    initialValues.carbonAssemblyExecutorId = wo.servicesData.carbon.assemblyExecutorId;
                    initialValues.carbonMountingExecutorId = wo.servicesData.carbon.mountingExecutorId;
                }
                if (wo.servicesData.wheelPainting) {
                    initialValues.wheelPaintingAmount = wo.servicesData.wheelPainting.amount;
                    initialValues.wheelPaintingPayoutAmount = wo.servicesData.wheelPainting.payoutAmount;
                    if (wo.servicesData.wheelPainting.dismounting) {
                        initialValues.wheelPaintingDismountingExecutorId = wo.servicesData.wheelPainting.dismounting.executorId;
                    }
                    if (wo.servicesData.wheelPainting.mounting) {
                        initialValues.wheelPaintingMountingExecutorId = wo.servicesData.wheelPainting.mounting.executorId;
                    }
                }
            }

            // Additional Services
            // Additional Services - Filter regulated ones
            if (wo.additionalServices && Array.isArray(wo.additionalServices)) {
                // Filter out any service that matches known keywords
                const knownKeywords = ['антихром', 'antichrome', 'плёнка', 'пленка', 'film', 'antigravity',
                    'химчистка', 'dry', 'cleaning', 'полировка', 'керамика', 'ceramic', 'polish',
                    'покраска дисков', 'покраска колёс', 'покраска колес', 'wheel', 'disk',
                    'карбон', 'carbon', 'шумоизоляция', 'soundproofing', 'noise'];

                const filtered = wo.additionalServices.filter((s: any) => {
                    if (!s.name) return false;
                    const lower = s.name.toLowerCase();
                    return !knownKeywords.some(k => lower.includes(k));
                });

                initialValues.additionalServices = filtered;
            }

            form.setFieldsValue(initialValues);
            setIsInitialized(true);
        }
    }, [initialLoading, workOrderData, form, isInitialized]);

    // Service Flags
    const hasAntichrome = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('антихром') || lower.includes('antichrome');
    }) || !!workOrderData?.armaturaExecutors;

    const hasFilm = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('плёнка') || lower.includes('пленка') || lower.includes('film') || lower.includes('antigravity');
    }) || !!workOrderData?.servicesData?.film;

    const hasDryCleaning = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('химчистка') || lower.includes('dry') || lower.includes('cleaning');
    }) || !!workOrderData?.servicesData?.dryCleaning;

    const hasPolishing = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('полировка') || lower.includes('керамика') || lower.includes('ceramic') || lower.includes('polish');
    }) || !!workOrderData?.servicesData?.polishing;

    const hasWheelPainting = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('покраска дисков') || lower.includes('покраска колёс') || lower.includes('покраска колес') || lower.includes('wheel') || lower.includes('disk');
    }) || !!workOrderData?.servicesData?.wheelPainting;

    const hasCarbon = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('карбон') || lower.includes('carbon');
    }) || !!workOrderData?.servicesData?.carbon;

    const hasSoundproofing = selectedServices.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('шумоизоляция') || lower.includes('soundproofing') || lower.includes('noise');
    }) || !!workOrderData?.servicesData?.soundproofing;
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
            if (values.soundproofingExecutorId) {
                servicesData.soundproofing = { executorId: values.soundproofingExecutorId, amount: values.soundproofingAmount || 0 };
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
            if (values.wheelPaintingPayoutAmount || values.wheelPaintingAmount) {
                const payout = values.wheelPaintingPayoutAmount || 0;
                servicesData.wheelPainting = {
                    amount: values.wheelPaintingAmount || 0,
                    payoutAmount: payout,
                    dismounting: {
                        executorId: values.wheelPaintingDismountingExecutorId,
                        amount: payout / 2,
                    },
                    mounting: {
                        executorId: values.wheelPaintingMountingExecutorId,
                        amount: payout / 2,
                    },
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
                    // Carbon Armatura
                    dismantlingExecutorId: values.carbonDismantlingExecutorId,
                    disassemblyExecutorId: values.carbonDisassemblyExecutorId,
                    assemblyExecutorId: values.carbonAssemblyExecutorId,
                    mountingExecutorId: values.carbonMountingExecutorId,
                };
            }

            const bodyPartsData: any = {};
            const bodyPartsList = [
                'radiatorGrille', 'frontBumper', 'lip', 'hood', 'fogLights',
                'fenders', 'windowMoldings', 'vents', 'doorHandles', 'doorMoldings',
                'mirrors', 'badges', 'inscriptions', 'trunkLid', 'spoiler',
                'rearBumper', 'diffuser', 'rearLights', 'fakeExhausts', 'sills',
                'hubCaps', 'railings', 'wheels', 'nozzles'
            ];
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
                    if (service.name) {
                        additionalServices.push({
                            name: service.name,
                            executorId: service.executorId || null,
                            amount: service.amount || 0,
                            executorAmount: service.executorAmount || 0, // NEW field
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

            await axios.patch(`/api/work-orders/${id}`, data);

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
                    onValuesChange={handleFormChange}
                    scrollToFirstError
                >
                    {/* Financial Block */}
                    <Card type="inner" title={<Space><DollarOutlined style={{ color: '#52c41a' }} /><Text strong>Финансовая информация</Text></Space>} style={{ marginBottom: 24, background: 'rgba(82, 196, 26, 0.05)' }}>
                        <Row gutter={[24, 0]}>
                            <Col xs={24} sm={12} lg={8}>
                                <Form.Item 
                                    label={<Text strong>Общая сумма З/Н</Text>} 
                                    name="totalAmount" 
                                    rules={[{ required: true }]}
                                    extra={<Text type="secondary" style={{ fontSize: 12 }}>Сумма = Услуги + Детали - Скидка</Text>}
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <InputNumber 
                                            style={{ width: '100%' }} 
                                            size="large" 
                                            min={0}
                                            placeholder="Введите сумму"
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                            parser={value => (value ? parseFloat(value.replace(/\s|₽/g, '')) : 0) as any}
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
                        hasSoundproofing={hasSoundproofing}
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
