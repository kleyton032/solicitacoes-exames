import { IUsersRepository, ICreateUserDTO } from "../IUsersRepository";
import { IUserDTO } from "../../dtos/IUserDTO";
import { PostgresConnection } from "../../../../shared/infra/database/postgres";

export class PostgresUsersRepository implements IUsersRepository {

    public async create({ legacy_user_id, name, email, password_hash, roles }: ICreateUserDTO): Promise<IUserDTO> {
        const db = PostgresConnection.getInstance();
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO users (legacy_user_id, name, email, password_hash)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, legacy_user_id, name, email, password_hash, created_at`,
                [legacy_user_id, name, email, password_hash]
            );

            const user = result.rows[0];

            if (roles && roles.length > 0) {
                for (const roleName of roles) {
                    // Find role ID
                    const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
                    if (roleRes.rows.length > 0) {
                        const roleId = roleRes.rows[0].id;
                        await client.query(
                            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
                            [user.id, roleId]
                        );
                    }
                }
            }

            await client.query('COMMIT');

            return {
                id: user.id,
                legacy_user_id: user.legacy_user_id,
                name: user.name,
                email: user.email,
                password_hash: user.password_hash,
                created_at: user.created_at,
                roles: roles || []
            };

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    public async findByEmail(email: string): Promise<IUserDTO | undefined> {
        const db = PostgresConnection.getInstance();
        const client = await db.getClient();

        try {
            const result = await client.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return undefined;
            }

            const user = result.rows[0];

            // Fetch roles
            const rolesRes = await client.query(
                `SELECT r.name FROM roles r
                 JOIN user_roles ur ON ur.role_id = r.id
                 WHERE ur.user_id = $1`,
                [user.id]
            );
            const roles = rolesRes.rows.map(r => r.name);

            return {
                id: user.id,
                legacy_user_id: user.legacy_user_id,
                name: user.name,
                email: user.email,
                password_hash: user.password_hash, // Postgres column matches
                created_at: user.created_at,
                roles
            };
        } finally {
            client.release();
        }
    }

    public async findById(id: number): Promise<IUserDTO | undefined> {
        const db = PostgresConnection.getInstance();
        const client = await db.getClient();

        try {
            const result = await client.query(
                'SELECT * FROM users WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return undefined;
            }

            const user = result.rows[0];

            const rolesRes = await client.query(
                `SELECT r.name FROM roles r
                 JOIN user_roles ur ON ur.role_id = r.id
                 WHERE ur.user_id = $1`,
                [user.id]
            );
            const roles = rolesRes.rows.map(r => r.name);

            return {
                id: user.id,
                legacy_user_id: user.legacy_user_id,
                name: user.name,
                email: user.email,
                password_hash: user.password_hash,
                created_at: user.created_at,
                roles
            };
        } finally {
            client.release();
        }
    }
}
