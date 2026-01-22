import { Request, Response } from 'express';
import { ListSolicitacoesService } from '../../../services/ListSolicitacoesService';

class ListSolicitacoesController {
    async handle(request: Request, response: Response): Promise<Response> {
        const listSolicitacoesService = new ListSolicitacoesService();

        const solicitacoes = await listSolicitacoesService.execute();

        return response.json(solicitacoes);
    }
}

export { ListSolicitacoesController };
