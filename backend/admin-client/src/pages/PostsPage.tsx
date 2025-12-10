import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Flex, Card, Grid, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../api';
import ImageUpload from '../components/ImageUpload';
import { slugify } from '../utils/slugify';

const { TextArea } = Input;
const { Option } = Select;

interface Post {
    id: number;
    type: 'NEWS' | 'ARTICLE';
    slug: string;
    title: string;
    image?: string;
    category: 'NEWS' | 'ARTICLES';
    datePublished?: string;
    views: number;
    excerpt: string;
    content: string;
    tags: string[];
    priority: number;
    status: 'DRAFT' | 'PUBLISHED';
}

export default function PostsPage() {
    const { message } = App.useApp();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [form] = Form.useForm();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/posts/admin');
            setPosts(response.data);
        } catch (error) {
            message.error('Ошибка загрузки постов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreate = () => {
        setEditingPost(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (post: Post) => {
        setEditingPost(post);
        form.setFieldsValue(post);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/posts/admin/${id}`);
            message.success('Пост удален');
            fetchPosts();
        } catch (error) {
            message.error('Ошибка удаления поста');
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        form.setFieldsValue({ title });
        if (!editingPost) {
            form.setFieldsValue({ slug: slugify(title) });
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            // Auto-set category based on type
            const data = {
                ...values,
                priority: parseInt(values.priority) || 0,
                category: values.type === 'NEWS' ? 'NEWS' : 'ARTICLES',
            };

            if (editingPost) {
                await api.put(`/posts/admin/${editingPost.id}`, data);
                message.success('Пост обновлен');
            } else {
                await api.post('/posts/admin', data);
                message.success('Пост создан');
            }
            setModalVisible(false);
            fetchPosts();
        } catch (error) {
            message.error('Ошибка сохранения поста');
        }
    };

    const screens = Grid.useBreakpoint();

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Заголовок', dataIndex: 'title', key: 'title' },
        { title: 'Slug', dataIndex: 'slug', key: 'slug' },
        { title: 'Тип', dataIndex: 'type', key: 'type', width: 100 },
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
            render: (_: any, record: Post) => (
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
                <h2 style={{ margin: 0 }}>Новости/Статьи</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Создать
                </Button>
            </div>

            {!screens.md ? (
                <Flex vertical gap={16}>
                    {posts.map((item) => (
                        <Card key={item.id} title={item.title} style={{ width: '100%' }}>
                            <p><strong>Тип:</strong> {item.type}</p>
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
                    dataSource={posts}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            )}

            <Modal
                key={editingPost?.id}
                title={editingPost ? 'Редактировать пост' : 'Создать пост'}
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
                    <Form.Item name="title" label="Заголовок" rules={[{ required: true }]}>
                        <Input onChange={handleTitleChange} />
                    </Form.Item>
                    <Form.Item name="slug" label="Slug (URL)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: screens.md ? '1fr 1fr' : '1fr', gap: 16 }}>
                        <Form.Item name="type" label="Тип" rules={[{ required: true }]}>
                            <Select>
                                <Option value="NEWS">NEWS</Option>
                                <Option value="ARTICLE">ARTICLE</Option>
                            </Select>
                        </Form.Item>
                        {/* Category is auto-set */}
                    </div>

                    <Form.Item name="excerpt" label="Краткое описание" rules={[{ required: true }]}>
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="content" label="Содержание" rules={[{ required: true }]}>
                        <TextArea rows={6} />
                    </Form.Item>
                    <Form.Item name="image" label="Обложка">
                        <ImageUpload />
                    </Form.Item>
                    <Form.Item name="tags" label="Теги">
                        <Select mode="tags" placeholder="Введите теги" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: screens.md ? '1fr 1fr' : '1fr', gap: 16 }}>
                        <Form.Item name="priority" label="Приоритет" initialValue={0}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
                            <Select>
                                <Option value="DRAFT">DRAFT</Option>
                                <Option value="PUBLISHED">PUBLISHED</Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
