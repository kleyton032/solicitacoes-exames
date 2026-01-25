import { Router } from 'express';
import { solicitacoesRoutes } from '../../../../modules/solicitacoes/infra/http/routes/solicitacoes.routes';
import { usersRoutes } from '../../../../modules/users/infra/http/routes/users.routes';
import { sessionsRoutes } from '../../../../modules/users/infra/http/routes/sessions.routes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/solicitacoes', solicitacoesRoutes);

export { routes };
