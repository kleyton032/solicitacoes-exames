import { Router } from 'express';
import { solicitacoesRoutes } from '../../../../modules/solicitacoes/infra/http/routes/solicitacoes.routes';
import { pacientesRoutes } from '../../../../modules/pacientes/infra/http/routes/pacientes.routes';
import { sessionsRoutes } from '../../../../modules/users/infra/http/routes/sessions.routes';
import { usersRoutes } from '../../../../modules/users/infra/http/routes/users.routes';
import { preAgendamentoRoutes } from '../../../../modules/preAgendamento/infra/http/routes/preAgendamento.routes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/solicitacoes', solicitacoesRoutes);
routes.use('/pacientes', pacientesRoutes);
routes.use('/pre-agendamento', preAgendamentoRoutes);

import { syncRoutes } from '../../../../modules/sync/infra/http/routes/sync.routes';
routes.use('/sync', syncRoutes);

export { routes };
