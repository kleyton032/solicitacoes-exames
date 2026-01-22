import { Router } from 'express';
import { ListSolicitacoesController } from '../controllers/ListSolicitacoesController';

const solicitacoesRoutes = Router();
const listSolicitacoesController = new ListSolicitacoesController();

solicitacoesRoutes.get('/', listSolicitacoesController.handle);

export { solicitacoesRoutes };
