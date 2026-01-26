import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Filter } from 'lucide-react';
import { solicitacoesService } from '../services/solicitacoesService';
import type { Solicitacao } from '../services/solicitacoesService';

type FilterFormData = {
    prontuario: string;
    cpf: string;
};

export function SolicitacoesList() {
    const { register, handleSubmit } = useForm<FilterFormData>();
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const onSubmit = async (data: FilterFormData) => {
        setLoading(true);
        setHasSearched(true);
        try {
            const cdPaciente = data.prontuario ? Number(data.prontuario) : undefined;
            const result = await solicitacoesService.findAll(cdPaciente);
            setSolicitacoes(result || []);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
            alert('Erro ao buscar dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-md">
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Consultas e Exames
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Gerencie e visualize as solicitações de exames
                </p>
            </div>


            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-md" style={{ flexWrap: 'wrap' }}>
                    <div className="flex flex-col" style={{ gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                        <label htmlFor="prontuario" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Prontuário</label>
                        <div className="flex items-center" style={{ position: 'relative' }}>
                            <input
                                id="prontuario"
                                type="number"
                                placeholder="Digite o código..."
                                {...register('prontuario')}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    outline: 'none'
                                }}
                            />
                            <Filter size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <div className="flex flex-col" style={{ gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                        <label htmlFor="cpf" style={{ fontSize: '0.875rem', fontWeight: '500' }}>CPF</label>
                        <div className="flex items-center" style={{ position: 'relative' }}>
                            <input
                                id="cpf"
                                type="text"
                                placeholder="000.000.000-00"
                                {...register('cpf')}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    outline: 'none'
                                }}
                            />
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.625rem 1.5rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </form>
            </div>


            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Prontuário</th>
                            <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>CPF</th>
                            <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>CNS</th>
                            <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Item Agend.</th>
                            <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitacoes.length > 0 ? (
                            solicitacoes.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{item.cd_paciente}</td>
                                    <td style={{ padding: '1rem' }}>{item.nr_cpf}</td>
                                    <td style={{ padding: '1rem' }}>{item.nr_cns}</td>
                                    <td style={{ padding: '1rem' }}>{item.cd_it_agend}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: 'var(--radius-full)',
                                            background: '#dcfce7',
                                            color: '#166534',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {item.tp_situacao}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    {hasSearched ? 'Nenhum registro encontrado.' : 'Utilize os filtros para buscar.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
