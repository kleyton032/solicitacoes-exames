import { api } from '../../../shared/infra/http/api';

export interface Paciente {
    cd_paciente: number;
    nm_paciente: string;
    nr_cpf: string;
    dt_nascimento: string;
    nr_cns: string;
}

export const pacientesService = {
    findByFilter: async ({ cd_paciente, nr_cpf }: { cd_paciente?: number; nr_cpf?: string }) => {
        let url = '/pacientes?';
        if (cd_paciente) url += `cd_paciente=${cd_paciente}&`;
        if (nr_cpf) url += `nr_cpf=${nr_cpf}`;

        return api.get(url) as Promise<Paciente[]>;
    }
};
