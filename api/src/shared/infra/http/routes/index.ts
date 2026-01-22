import { Router } from 'express';
import { solicitacoesRoutes } from '../../../../modules/solicitacoes/infra/http/routes/solicitacoes.routes';
import { pacientesRoutes } from '../../../../modules/pacientes/infra/http/routes/pacientes.routes';

const routes = Router();

routes.use('/solicitacoes', solicitacoesRoutes);
routes.use('/pacientes', pacientesRoutes);

export { routes };
