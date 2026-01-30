import { api } from '../../../shared/infra/http/api';

export interface Solicitacao {
    cd_paciente: number;
    nr_cpf: string;
    nr_cns: string;
    cd_it_agend: number;
    tp_situacao: string;
    ds_item_agendamento: string;
    dt_lanca_lista: string;
    item_agendamento_correlato?: string;
    ds_item_agendamento_correlato?: string;
    cd_multi_empresa: string;
}

export const solicitacoesService = {
    findAll: async (cdPaciente?: number) => {
        let url = '/solicitacoes';
        if (cdPaciente) {
            url += `?cd_paciente=${cdPaciente}`;
        }
        return api.get(url) as Promise<Solicitacao[]>;
    }
};

