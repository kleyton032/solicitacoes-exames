
import { Pool } from 'pg';
import 'dotenv/config';

class PostgresConnection {
    private static instance: PostgresConnection;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: Number(process.env.POSTGRES_PORT),
        });

        this.pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    public static getInstance(): PostgresConnection {
        if (!PostgresConnection.instance) {
            PostgresConnection.instance = new PostgresConnection();
        }
        return PostgresConnection.instance;
    }

    public async query(text: string, params?: any[]) {
        const start = Date.now();
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;
        return res;
    }

    public async getClient() {
        const client = await this.pool.connect();
        return client;
    }
}

export { PostgresConnection };
