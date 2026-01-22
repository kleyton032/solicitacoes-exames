import { Router } from 'express';
import { solicitacoesRoutes } from '../../../../modules/solicitacoes/infra/http/routes/solicitacoes.routes';

const routes = Router();

routes.use('/solicitacoes', solicitacoesRoutes);

export { routes };
