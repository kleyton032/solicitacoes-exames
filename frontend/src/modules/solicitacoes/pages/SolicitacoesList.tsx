import { useState } from 'react';
import { Form, Input, Button, Table, Card, Typography, Space, Divider, Tag } from 'antd';
import { SearchOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { solicitacoesService } from '../services/solicitacoesService';
import { pacientesService } from '../services/pacientesService';
import type { Paciente } from '../services/pacientesService';
import type { Solicitacao } from '../services/solicitacoesService';



const { Title, Text } = Typography;

type FilterFormData = {
    prontuario: string;
    cpf: string;
};

export function SolicitacoesList() {
    const [form] = Form.useForm();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);



    const onFinish = async (values: FilterFormData) => {
        setLoading(true);
        setHasSearched(true);
        setSelectedPaciente(null);
        setSolicitacoes([]);
        try {
            const result = await pacientesService.findByFilter({
                cd_paciente: values.prontuario ? Number(values.prontuario) : undefined,
                nr_cpf: values.cpf || undefined
            });
            setPacientes(result || []);

            // Se houver apenas um paciente, seleciona automaticamente
            if (result && result.length === 1) {
                handleSelectPaciente(result[0]);
            }
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPaciente = async (paciente: Paciente) => {
        setSelectedPaciente(paciente);
        setLoadingSolicitacoes(true);
        try {
            const result = await solicitacoesService.findAll(paciente.cd_paciente);
            setSolicitacoes(result || []);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
        } finally {
            setLoadingSolicitacoes(false);
        }
    };

    const patientColumns = [
        { title: 'Prontuário', dataIndex: 'cd_paciente', key: 'cd_paciente' },
        { title: 'Nome', dataIndex: 'nm_paciente', key: 'nm_paciente' },
        { title: 'CPF', dataIndex: 'nr_cpf', key: 'nr_cpf' },
        {
            title: 'Nascimento',
            dataIndex: 'dt_nascimento',
            key: 'dt_nascimento',
            render: (text: string) => text ? new Date(text).toLocaleDateString('pt-BR') : '-'
        },
        {
            title: 'Ação',
            key: 'action',
            render: (_: any, record: Paciente) => (
                <Button
                    type="link"
                    icon={<FileTextOutlined />}
                    onClick={() => handleSelectPaciente(record)}
                >
                    Ver Solicitações
                </Button>
            ),
        },
    ];

    const solicitacaoColumns = [
        {
            title: 'Item Agend.',
            key: 'item_agendamento',
            render: (_: any, record: Solicitacao) => (
                <Space direction="vertical" size={2}>
                    <Text>{record.cd_it_agend}-{record.ds_item_agendamento}</Text>
                    {record.item_agendamento_correlato && (
                        <Card
                            size="small"
                            style={{
                                background: '#fffbe6',
                                border: '1px solid #ffe58f',
                                fontSize: '11px'
                            }}
                            bodyStyle={{ padding: '4px 8px' }}
                        >
                            <Space direction="vertical" size={0}>
                                <Text strong style={{ fontSize: '10px', color: '#856404' }}>
                                    ⚠️ POSSÍVEL AGENDAMENTO:
                                </Text>
                                <Text style={{ fontSize: '11px' }}>
                                    {new Date(record.item_agendamento_correlato).toLocaleString('pt-BR')}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '10px' }}>
                                    {record.ds_item_agendamento_correlato}
                                </Text>
                            </Space>
                        </Card>
                    )}
                </Space>
            )
        },
        {
            title: 'Data Solicitação',
            dataIndex: 'dt_lanca_lista',
            key: 'dt_lanca_lista',
            render: (text: string) => {
                if (!text) return '-';
                const date = new Date(text);
                return date.toLocaleDateString('pt-BR');
            }
        },
        {
            title: 'Situação',
            dataIndex: 'tp_situacao',
            key: 'tp_situacao',
            render: (text: string) => {
                let backgroundColor = '#f1f5f9';
                let textColor = '#475569';

                switch (text) {
                    case 'Aguardando': backgroundColor = '#fff7e6'; textColor = '#fa8c16'; break;
                    case 'Erro na Marcação': backgroundColor = '#f9f0ff'; textColor = '#722ed1'; break;
                    case 'Atendido': backgroundColor = '#f6ffed'; textColor = '#52c41a'; break;
                    case 'Cancelado': backgroundColor = '#fff1f0'; textColor = '#ff4d4f'; break;
                    case 'Marcado': backgroundColor = '#feffe6'; textColor = '#d4b106'; break;
                    case 'Solicitado': backgroundColor = '#e6f4ff'; textColor = '#0958d9'; break;
                }

                return (
                    <Tag color={backgroundColor} style={{ color: textColor, border: 'none', fontWeight: 600 }}>
                        {text}
                    </Tag>
                );
            },
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                <Title level={2} style={{ margin: 0 }}>Gestão de Solicitações</Title>
                <Text type="secondary">Busque o paciente para visualizar seu histórico de exames e consultas</Text>
            </div>

            <Card title={<span><UserOutlined /> Buscar Paciente</span>}>
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
                        <Input prefix={<SearchOutlined />} placeholder="Código do paciente" type="number" />
                    </Form.Item>

                    <Form.Item
                        name="cpf"
                        label="CPF"
                        style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
                    >
                        <Input prefix={<SearchOutlined />} placeholder="000.000.000-00" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
                            Pesquisar Paciente
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {hasSearched && !selectedPaciente && (
                <Card title="Pacientes Encontrados">
                    <Table
                        dataSource={pacientes}
                        columns={patientColumns}
                        rowKey="cd_paciente"
                        pagination={{ pageSize: 5 }}
                        loading={loading}
                        locale={{ emptyText: 'Nenhum paciente encontrado.' }}
                    />
                </Card>
            )}

            {selectedPaciente && (
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>{selectedPaciente.nm_paciente}</Title>
                            <Space split={<Divider type="vertical" />}>
                                <Text type="secondary">Prontuário: {selectedPaciente.cd_paciente}</Text>
                                <Text type="secondary">CPF: {selectedPaciente.nr_cpf}</Text>
                                <Text type="secondary">CNS: {selectedPaciente.nr_cns}</Text>
                                <Text type="secondary">Nascimento: {selectedPaciente.dt_nascimento ? new Date(selectedPaciente.dt_nascimento).toLocaleDateString('pt-BR') : '-'}</Text>
                            </Space>
                        </div>
                        <Button onClick={() => setSelectedPaciente(null)}>Voltar para a busca</Button>
                    </div>

                    <Divider />

                    <Title level={5} style={{ marginBottom: 16 }}><FileTextOutlined /> Solicitações do Paciente</Title>
                    <Table
                        dataSource={solicitacoes}
                        columns={solicitacaoColumns}
                        rowKey={(record) => `${record.cd_paciente}-${record.cd_it_agend}`}
                        loading={loadingSolicitacoes}
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: 'Nenhuma solicitação encontrada para este paciente.' }}
                    />
                </Card>
            )}


        </Space>
    );
}


