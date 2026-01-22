import { Request, Response } from 'express';
import { ListSolicitacoesService } from '../../../services/ListSolicitacoesService';

class ListSolicitacoesController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { cd_paciente } = request.query;
        const listSolicitacoesService = new ListSolicitacoesService();

        const solicitacoes = await listSolicitacoesService.execute(cd_paciente ? Number(cd_paciente) : undefined);

        return response.json(solicitacoes);
    }
}

export { ListSolicitacoesController };
