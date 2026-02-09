import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { api } from '../../../shared/infra/http/api';
import { ManageRolesModal } from '../components/ManageRolesModal';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

export const UsersListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response as User[]);
        } catch (error) {
            console.error('Erro ao carregar usuários', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleEditRoles = (user: User) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleModalSuccess = () => {
        setModalVisible(false);
        setSelectedUser(null);
        loadUsers();
    };

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Permissões',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles: string[]) => (
                <>
                    {roles && roles.map(role => (
                        <Tag color="blue" key={role}>
                            {role}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: User) => (
                <Tooltip title="Gerenciar Permissões">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditRoles(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card title="Gerenciamento de Usuários">
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <ManageRolesModal
                visible={modalVisible}
                user={selectedUser}
                onCancel={() => setModalVisible(false)}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};
