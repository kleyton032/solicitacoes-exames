import { Router } from 'express';
import { SyncController } from '../controllers/SyncController';

const syncRoutes = Router();
const syncController = new SyncController();

syncRoutes.post('/data', syncController.handle);
syncRoutes.post('/log', syncController.handleLog);

export { syncRoutes };
