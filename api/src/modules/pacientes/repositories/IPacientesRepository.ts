import { IPacienteDTO } from '../dtos/IPacienteDTO';

export interface ISearchPacienteFilter {
    cd_paciente?: number;
    nr_cpf?: string;
}

export interface IPacientesRepository {
    findByFilter(filter: ISearchPacienteFilter): Promise<IPacienteDTO[]>;
}
