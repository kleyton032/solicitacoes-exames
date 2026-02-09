import React, { useEffect, useState } from 'react';
import { Modal, Checkbox, message, Spin } from 'antd';
import { api } from '../../../shared/infra/http/api';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    roles: string[];
}

interface ManageRolesModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    user: User | null;
}

export const ManageRolesModal: React.FC<ManageRolesModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    user
}) => {
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible && user) {
            loadRoles();
            setSelectedRoles(user.roles || []);
        }
    }, [visible, user]);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/roles');
            setAvailableRoles(response as Role[]);
        } catch (error) {
            message.error('Erro ao carregar roles');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;

        setSubmitting(true);
        try {
            await api.post(`/users/${user.id}/roles`, {
                roles: selectedRoles
            });
            message.success('Permissões atualizadas com sucesso');
            onSuccess();
        } catch (error) {
            message.error('Erro ao atualizar permissões');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setSelectedRoles(prev => [...prev, roleName]);
        } else {
            setSelectedRoles(prev => prev.filter(r => r !== roleName));
        }
    };

    return (
        <Modal
            title={`Gerenciar Permissões - ${user?.name}`}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={submitting}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableRoles.map(role => (
                        <Checkbox
                            key={role.id}
                            checked={selectedRoles.includes(role.name)}
                            onChange={e => handleRoleChange(role.name, e.target.checked)}
                        >
                            {role.name}
                        </Checkbox>
                    ))}
                </div>
            )}
        </Modal>
    );
};
