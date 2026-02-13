import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, DatePicker, Flex, Card, Grid, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import ImageUpload from '../components/ImageUpload';
import { slugify } from '../utils/slugify';

const { TextArea } = Input;
const { Option } = Select;

interface PortfolioItem {
    id: number;
    slug: string;
    title: string;
    carBrand: string;
    carModel: string;
    services: string[];
    mainImage: string;
    gallery: string[];
    description: string;
    date: string;
    featured: boolean;
    views: number;
    status: 'DRAFT' | 'PUBLISHED';
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

export default function PortfolioPage() {
    const { message } = App.useApp();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [form] = Form.useForm();

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/portfolio/admin');
            setItems(response.data);
        } catch (error) {
            message.error('Ошибка загрузки портфолио');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = () => {
        setEditingItem(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        form.setFieldsValue({ title });
        if (!editingItem) {
            form.setFieldsValue({ slug: slugify(title) });
        }
    };

    const handleEdit = (item: PortfolioItem) => {
        setEditingItem(item);
        form.setFieldsValue({
            ...item,
            date: item.date ? dayjs(item.date) : undefined,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/portfolio/admin/${id}`);
            message.success('Работа удалена');
            fetchItems();
        } catch (error) {
            message.error('Ошибка удаления работы');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
                date: values.date ? values.date.toISOString() : new Date().toISOString(),
            };
            if (editingItem) {
                await api.put(`/portfolio/admin/${editingItem.id}`, data);
                message.success('Работа обновлена');
            } else {
                await api.post('/portfolio/admin', data);
                message.success('Работа создана');
            }
            setModalVisible(false);
            fetchItems();
        } catch (error) {
            message.error('Ошибка сохранения работы');
        }
    };

    const screens = Grid.useBreakpoint();

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Название', dataIndex: 'title', key: 'title' },
        { title: 'Марка', dataIndex: 'carBrand', key: 'carBrand' },
        { title: 'Модель', dataIndex: 'carModel', key: 'carModel' },
        { title: 'Просмотры', dataIndex: 'views', key: 'views', width: 100 },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => (
                <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>{status}</Tag>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 200,
            render: (_: any, record: PortfolioItem) => (
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
                <h2 style={{ margin: 0 }}>Портфолио</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Создать
                </Button>
            </div>

            {!screens.md ? (
                <Flex vertical gap={16}>
                    {items.map((item) => (
                        <Card key={item.id} title={item.title} style={{ width: '100%' }}>
                            <p><strong>Авто:</strong> {item.carBrand} {item.carModel}</p>
                            <p><strong>Статус:</strong> <Tag color={item.status === 'PUBLISHED' ? 'green' : 'orange'}>{item.status}</Tag></p>
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
                    dataSource={items}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            )}

            <Modal
                key={editingItem?.id}
                title={editingItem ? 'Редактировать работу' : 'Создать работу'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                afterClose={() => {
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={screens.md ? 900 : '100%'}
                style={{ top: screens.md ? 100 : 0, margin: screens.md ? undefined : 0, maxWidth: '100vw' }}
                styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="title" label="Название" rules={[{ required: true }]}>
                        <Input onChange={handleTitleChange} />
                    </Form.Item>
                    <Form.Item name="slug" label="Slug (URL)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: screens.md ? '1fr 1fr' : '1fr', gap: 16 }}>
                        <Form.Item name="carBrand" label="Марка авто" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="carModel" label="Модель авто" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item name="services" label="Услуги" rules={[{ required: true }]}>
                        <Select mode="multiple">
                            {services.map(s => <Option key={s.key} value={s.key}>{s.label}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Описание">
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="mainImage" label="Главное изображение">
                        <ImageUpload />
                    </Form.Item>
                    <Form.Item name="gallery" label="Галерея">
                        <ImageUpload multiple />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: screens.md ? '1fr 1fr' : '1fr', gap: 16 }}>
                        <Form.Item name="date" label="Дата">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="featured" label="Избранное" valuePropName="checked">
                            <Select>
                                <Option value={true}>Да</Option>
                                <Option value={false}>Нет</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
                        <Select>
                            <Option value="DRAFT">DRAFT</Option>
                            <Option value="PUBLISHED">PUBLISHED</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
