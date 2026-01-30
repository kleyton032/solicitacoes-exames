
import { PostgresConnection } from './src/shared/infra/database/postgres/index';

async function testConnection() {
    try {
        console.log('Testing Postgres Connection...');
        const db = PostgresConnection.getInstance();
        const result = await db.query('SELECT NOW() as now');
        console.log('Connection Successful!', result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('Connection Failed:', error);
        process.exit(1);
    }
}

testConnection();
