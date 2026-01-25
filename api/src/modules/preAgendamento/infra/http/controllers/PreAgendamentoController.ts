import { Request, Response } from "express";
import { OraclePreAgendamentoRepository } from "../../../repositories/oracle/OraclePreAgendamentoRepository";
import { ListPreAgendamentoByPacienteService } from "../../../services/ListPreAgendamentoByPacienteService";

export class PreAgendamentoController {
    public async index(request: Request, response: Response): Promise<Response> {
        const { cd_paciente } = request.params;
        const { cd_paciente: cd_paciente_query } = request.query;

        const pacienteId = cd_paciente || cd_paciente_query;

        if (!pacienteId) {
            return response.status(400).json({ error: "Código do paciente não fornecido." });
        }

        const preAgendamentoRepository = new OraclePreAgendamentoRepository();
        const listPreAgendamentoByPaciente = new ListPreAgendamentoByPacienteService(preAgendamentoRepository);

        const preAgendamentos = await listPreAgendamentoByPaciente.execute(Number(pacienteId));

        return response.json(preAgendamentos);
    }
}
