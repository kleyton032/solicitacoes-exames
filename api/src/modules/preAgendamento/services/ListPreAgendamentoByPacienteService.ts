import { IPreAgendamentoDTO } from "../dtos/IPreAgendamentoDTO";
import { IPreAgendamentoRepository } from "../repositories/IPreAgendamentoRepository";

export class ListPreAgendamentoByPacienteService {
    constructor(private preAgendamentoRepository: IPreAgendamentoRepository) { }

    public async execute(cd_paciente: number): Promise<IPreAgendamentoDTO[]> {
        const preAgendamentos = await this.preAgendamentoRepository.findByPaciente(cd_paciente);

        return preAgendamentos;
    }
}
