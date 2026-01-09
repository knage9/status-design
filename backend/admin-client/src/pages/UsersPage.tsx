import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, Tag, App, Switch, Grid, Flex, Typography, FloatButton, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { notification, modal } = App.useApp();
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // < 768px

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            notification.error({ title: 'Ошибка загрузки пользователей' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setEditingUser(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        modal.confirm({
            title: 'Удалить пользователя?',
            content: 'Это действие нельзя отменить.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`/api/users/${id}`);
                    notification.success({ title: 'Пользователь удален' });
                    fetchUsers();
                } catch (error) {
                    notification.error({ title: 'Ошибка удаления' });
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingUser) {
                await axios.patch(`/api/users/${editingUser.id}`, values);
                notification.success({ title: 'Пользователь обновлен' });
            } else {
                await axios.post('/api/users', values);
                notification.success({ title: 'Пользователь создан' });
            }
            setModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            notification.error({ title: error.response?.data?.message || 'Ошибка сохранения' });
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            ADMIN: 'red',
            MANAGER: 'blue',
            MASTER: 'green',
            EXECUTOR: 'orange',
        };
        const labels: Record<string, string> = {
            ADMIN: 'Админ',
            MANAGER: 'Менеджер',
            MASTER: 'Мастер',
            EXECUTOR: 'Исполнитель',
        };
        return <Tag color={colors[role]}>{labels[role]}</Tag>;
    };

    // Mobile User Card
    const MobileUserCard = ({ user }: { user: User }) => (
        <Card
            size="small"
            style={{ marginBottom: 12 }}
            hoverable
        >
            <Flex vertical gap={8}>
                <Flex justify="space-between" align="start">
                    <div>
                        <Text strong style={{ fontSize: 16 }}>{user.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ID: {user.id}
                        </Text>
                    </div>
                    <Flex vertical gap={4} align="flex-end">
                        {getRoleBadge(user.role)}
                        <Tag color={user.isActive ? 'green' : 'red'}>
                            {user.isActive ? 'Активен' : 'Неактивен'}
                        </Tag>
                    </Flex>
                </Flex>

                <Divider style={{ margin: '8px 0' }} />

                <Flex vertical gap={4}>
                    <Text style={{ fontSize: 13 }}>
                        <MailOutlined /> {user.email}
                    </Text>
                    {user.phone && (
                        <Text style={{ fontSize: 13 }}>
                            <PhoneOutlined /> {user.phone}
                        </Text>
                    )}
                </Flex>

                <Flex gap={8} style={{ marginTop: 8 }}>
                    <Button
                        icon={<EditOutlined />}
                        size="large"
                        style={{ flex: 1 }}
                        onClick={() => handleEdit(user)}
                    >
                        Изменить
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="large"
                        style={{ flex: 1 }}
                        onClick={() => handleDelete(user.id)}
                    >
                        Удалить
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Телефон',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone?: string) => phone || '—',
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => getRoleBadge(role),
        },
        {
            title: 'Активен',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Да' : 'Нет'}</Tag>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: any, record: User) => (
                <>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Изменить
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Удалить
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Card
                title="Пользователи"
                extra={
                    !isMobile && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            Создать пользователя
                        </Button>
                    )
                }
            >
                {isMobile ? (
                    /* Mobile Card List */
                    <div>
                        {loading ? (
                            <Card loading={true} />
                        ) : users.length > 0 ? (
                            users.map(user => (
                                <MobileUserCard key={user.id} user={user} />
                            ))
                        ) : (
                            <Card>
                                <Text type="secondary">Нет пользователей</Text>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Desktop Table */
                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        loading={loading}
                    />
                )}
            </Card>

            {/* FAB for mobile */}
            {isMobile && (
                <FloatButton
                    icon={<PlusOutlined />}
                    type="primary"
                    style={{ right: 24, bottom: 24 }}
                    onClick={handleCreate}
                    tooltip="Создать пользователя"
                />
            )}

            <Modal
                title={editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                width={isMobile ? '100%' : 600}
                style={isMobile ? { top: 0, maxWidth: '100%', padding: 0 } : undefined}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Имя"
                        rules={[{ required: true, message: 'Введите имя' }]}
                    >
                        <Input size={isMobile ? 'large' : 'middle'} />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Введите email' },
                            { type: 'email', message: 'Некорректный email' },
                        ]}
                    >
                        <Input size={isMobile ? 'large' : 'middle'} />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Пароль"
                            rules={[{ required: true, message: 'Введите пароль', min: 6 }]}
                        >
                            <Input.Password size={isMobile ? 'large' : 'middle'} />
                        </Form.Item>
                    )}

                    <Form.Item name="phone" label="Телефон">
                        <Input size={isMobile ? 'large' : 'middle'} />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Роль"
                        rules={[{ required: true, message: 'Выберите роль' }]}
                    >
                        <Select size={isMobile ? 'large' : 'middle'}>
                            <Select.Option value="ADMIN">Админ</Select.Option>
                            <Select.Option value="MANAGER">Менеджер</Select.Option>
                            <Select.Option value="MASTER">Мастер</Select.Option>
                            <Select.Option value="EXECUTOR">Исполнитель</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="isActive" label="Активен" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UsersPage;
