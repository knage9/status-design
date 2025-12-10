import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, Tag, App, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

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

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/users');
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
        form.setFieldsValues(user);
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        modal.confirm({
            title: 'Удалить пользователя?',
            content: 'Это действие нельзя отменить.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`http://localhost:3000/api/users/${id}`);
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
                await axios.patch(`http://localhost:3000/api/users/${editingUser.id}`, values);
                notification.success({ title: 'Пользователь обновлен' });
            } else {
                await axios.post('http://localhost:3000/api/users', values);
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Создать пользователя
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                width={600}
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
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Введите email' },
                            { type: 'email', message: 'Некорректный email' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Пароль"
                            rules={[{ required: true, message: 'Введите пароль', min: 6 }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item name="phone" label="Телефон">
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Роль"
                        rules={[{ required: true, message: 'Выберите роль' }]}
                    >
                        <Select>
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
