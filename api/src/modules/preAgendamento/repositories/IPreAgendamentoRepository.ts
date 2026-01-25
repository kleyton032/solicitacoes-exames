import { IPreAgendamentoDTO } from "../dtos/IPreAgendamentoDTO";

export interface IPreAgendamentoRepository {
    findByPaciente(cd_paciente: number): Promise<IPreAgendamentoDTO[]>;
}
