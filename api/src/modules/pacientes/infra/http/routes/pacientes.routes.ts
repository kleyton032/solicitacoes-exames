import { Router } from 'express';
import { SearchPacienteController } from '../controllers/SearchPacienteController';

const pacientesRoutes = Router();
const searchPacienteController = new SearchPacienteController();

pacientesRoutes.get('/', searchPacienteController.handle);

export { pacientesRoutes };
