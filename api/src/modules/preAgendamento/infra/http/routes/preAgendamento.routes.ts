import { Router } from "express";
import { ensureAuthenticated } from "../../../../../shared/infra/http/middlewares/ensureAuthenticated";
import { PreAgendamentoController } from "../controllers/PreAgendamentoController";

const preAgendamentoRoutes = Router();
const preAgendamentoController = new PreAgendamentoController();

preAgendamentoRoutes.use(ensureAuthenticated);

preAgendamentoRoutes.get("/", preAgendamentoController.index);
preAgendamentoRoutes.get("/:cd_paciente", preAgendamentoController.index);

export { preAgendamentoRoutes };
