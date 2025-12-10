import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Tag, Flex, Card, Grid, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../api';
import ImageUpload from '../components/ImageUpload';

const { TextArea } = Input;
const { Option } = Select;

interface Review {
    id: number;
    rating: number;
    service: string;
    carBrand: string;
    carModel: string;
    text: string;
    dateCreated: string;
    datePublished?: string;
    status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
    images: string[];
    servicesSelected: string[];
    tags: string[];
}

const services = [
    { key: 'carbon', label: 'Карбон' },
    { key: 'antichrome', label: 'Антихром' },
    { key: 'soundproofing', label: 'Шумоизоляция' },
    { key: 'antigravity-film', label: 'Антигравийная пленка' },
    { key: 'disk-painting', label: 'Покраска дисков' },
    { key: 'cleaning', label: 'Детейлинг мойка' },
    { key: 'ceramic', label: 'Керамика' },
    { key: 'polish', label: 'Полировка' },
];

export default function ReviewsPage() {
    const { message } = App.useApp();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [form] = Form.useForm();

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reviews/admin');
            setReviews(response.data);
        } catch (error) {
            message.error('Ошибка загрузки отзывов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleCreate = () => {
        setEditingReview(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (review: Review) => {
        setEditingReview(review);
        form.setFieldsValue(review);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/reviews/admin/${id}`);
            message.success('Отзыв удален');
            fetchReviews();
        } catch (error) {
            message.error('Ошибка удаления отзыва');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingReview) {
                await api.put(`/reviews/admin/${editingReview.id}`, values);
                message.success('Отзыв обновлен');
            } else {
                await api.post('/reviews/admin', values);
                message.success('Отзыв создан');
            }
            setModalVisible(false);
            fetchReviews();
        } catch (error) {
            message.error('Ошибка сохранения отзыва');
        }
    };

    const screens = Grid.useBreakpoint();

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Марка', dataIndex: 'carBrand', key: 'carBrand' },
        { title: 'Модель', dataIndex: 'carModel', key: 'carModel' },
        { title: 'Рейтинг', dataIndex: 'rating', key: 'rating', width: 80 },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const color = status === 'PUBLISHED' ? 'green' : status === 'PENDING' ? 'orange' : 'red';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 200,
            render: (_: any, record: Review) => (
                <>
                    <Button size="small" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
                        Ред.
                    </Button>
                    <Button size="small" danger onClick={() => handleDelete(record.id)}>
                        Удал.
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Отзывы</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Создать
                </Button>
            </div>

            {!screens.md ? (
                <Flex vertical gap={16}>
                    {reviews.map((item) => (
                        <Card key={item.id} title={`${item.carBrand} ${item.carModel}`} style={{ width: '100%' }}>
                            <p><strong>Рейтинг:</strong> {item.rating}</p>
                            <p><strong>Статус:</strong> <Tag color={item.status === 'PUBLISHED' ? 'green' : item.status === 'PENDING' ? 'orange' : 'red'}>{item.status}</Tag></p>
                            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                <Button onClick={() => handleEdit(item)}>Редактировать</Button>
                                <Button danger onClick={() => handleDelete(item.id)}>Удалить</Button>
                            </div>
                        </Card>
                    ))}
                </Flex>
            ) : (
                <Table
                    columns={columns}
                    dataSource={reviews}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            )}

            <Modal
                key={editingReview?.id}
                title={editingReview ? 'Редактировать отзыв' : 'Создать отзыв'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                afterClose={() => {
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={screens.md ? 800 : '100%'}
                style={{ top: screens.md ? 100 : 0, margin: screens.md ? undefined : 0, maxWidth: '100vw' }}
                styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: screens.md ? '1fr 1fr' : '1fr', gap: 16 }}>
                        <Form.Item name="carBrand" label="Марка авто" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="carModel" label="Модель авто" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: screens.md ? '1fr 1fr' : '1fr', gap: 16 }}>
                        <Form.Item name="rating" label="Рейтинг" rules={[{ required: true }]}>
                            <InputNumber min={1} max={5} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="servicesSelected" label="Выбранные услуги">
                            <Select mode="multiple">
                                {services.map(s => <Option key={s.key} value={s.key}>{s.label}</Option>)}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="text" label="Текст отзыва" rules={[{ required: true }]}>
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item name="tags" label="Теги (генерируются автоматически, можно править)">
                        <Select mode="tags" placeholder="Введите теги" />
                    </Form.Item>

                    <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
                        <Select>
                            <Option value="PENDING">PENDING</Option>
                            <Option value="PUBLISHED">PUBLISHED</Option>
                            <Option value="REJECTED">REJECTED</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="images" label="Изображения">
                        <ImageUpload multiple />
                    </Form.Item>
                    {/* Tags are auto-generated on backend */}
                </Form>
            </Modal>
        </div>
    );
}
