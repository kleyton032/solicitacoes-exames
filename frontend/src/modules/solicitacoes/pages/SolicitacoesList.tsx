import { useState } from 'react';
import { Form, Input, Button, Table, Card, Typography, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { solicitacoesService } from '../services/solicitacoesService';
import type { Solicitacao } from '../services/solicitacoesService';

const { Title, Text } = Typography;

type FilterFormData = {
    prontuario: string;
    cpf: string;
};

export function SolicitacoesList() {
    const [form] = Form.useForm();
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const onFinish = async (values: FilterFormData) => {
        setLoading(true);
        setHasSearched(true);
        try {
            const cdPaciente = values.prontuario ? Number(values.prontuario) : undefined;
            const result = await solicitacoesService.findAll(cdPaciente);
            setSolicitacoes(result || []);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Prontuário', dataIndex: 'cd_paciente', key: 'cd_paciente' },
        { title: 'CPF', dataIndex: 'nr_cpf', key: 'nr_cpf' },
        { title: 'CNS', dataIndex: 'nr_cns', key: 'nr_cns' },
        {
            title: 'Item Agend.',
            key: 'item_agendamento',
            render: (_: any, record: Solicitacao) => (
                <span>{record.cd_it_agend}-{record.ds_item_agendamento}</span>
            )
        },
        {
            title: 'Situação',
            dataIndex: 'tp_situacao',
            key: 'tp_situacao',
            render: (text: string) => {
                let backgroundColor = '#f1f5f9';
                let textColor = '#475569';

                switch (text) {
                    case 'Aguardando':
                        backgroundColor = '#fff7ed';
                        textColor = '#9a3412';
                        break;
                    case 'Atendido':
                        backgroundColor = '#dcfce7';
                        textColor = '#166534';
                        break;
                    case 'Cancelado':
                        backgroundColor = '#fee2e2';
                        textColor = '#b91c1c';
                        break;
                    case 'Marcado':
                        backgroundColor = '#eff6ff';
                        textColor = '#1e40af';
                        break;
                    case 'Solicitado':
                        backgroundColor = '#f0fdf4';
                        textColor = '#15803d';
                        break;
                }

                return (
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 9999,
                        background: backgroundColor,
                        color: textColor,
                        fontSize: '0.75rem',
                        fontWeight: '600'
                    }}>
                        {text}
                    </span>
                );
            },
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                <Title level={2} style={{ margin: 0 }}>Consultas e Exames</Title>
                <Text type="secondary">Gerencie e visualize as solicitações de exames</Text>
            </div>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}
                >
                    <Form.Item
                        name="prontuario"
                        label="Prontuário"
                        style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
                    >
                        <Input
                            prefix={<FilterOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Digite o código..."
                            type="number"
                        />
                    </Form.Item>

                    <Form.Item
                        name="cpf"
                        label="CPF"
                        style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
                    >
                        <Input
                            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="000.000.000-00"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
                            Pesquisar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card bodyStyle={{ padding: 0 }} style={{ overflow: 'hidden' }}>
                <Table
                    dataSource={solicitacoes}
                    columns={columns}
                    rowKey={(record) => `${record.cd_paciente}-${record.cd_it_agend}`}
                    locale={{ emptyText: hasSearched ? 'Nenhum registro encontrado.' : 'Utilize os filtros para buscar.' }}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </Space>
    );
}
