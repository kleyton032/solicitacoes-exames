import { Request, Response } from 'express';
import { SearchPacienteService } from '../../../services/SearchPacienteService';

class SearchPacienteController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { cd_paciente, nr_cpf } = request.query;

        const searchPacienteService = new SearchPacienteService();

        const pacientes = await searchPacienteService.execute({
            cd_paciente: cd_paciente ? Number(cd_paciente) : undefined,
            nr_cpf: nr_cpf ? String(nr_cpf) : undefined,
        });

        return response.json(pacientes);
    }
}

export { SearchPacienteController };
