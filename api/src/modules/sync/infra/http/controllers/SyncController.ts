import { Request, Response } from 'express';
import { SyncService } from '../../../services/SyncService';

export class SyncController {
    async handle(request: Request, response: Response): Promise<Response> {
        const data = request.body;

        const apiKey = request.headers['x-sync-key'];
        if (apiKey !== process.env.SYNC_API_KEY) {
            return response.status(401).json({ error: 'Unauthorized' });
        }

        const syncService = new SyncService();
        await syncService.execute(data);

        return response.status(200).json({ message: 'Sync successful' });
    }

    async handleLog(request: Request, response: Response): Promise<Response> {
        const { status, message, payload_summary } = request.body;

        const apiKey = request.headers['x-sync-key'];
        if (apiKey !== process.env.SYNC_API_KEY) {
            return response.status(401).json({ error: 'Unauthorized' });
        }

        const syncService = new SyncService();
        await syncService.saveLog({ status, message, payload_summary });

        return response.status(200).json({ message: 'Log saved' });
    }
}
