import { IUsersRepository, ICreateUserDTO } from "../IUsersRepository";
import { IUserDTO } from "../../dtos/IUserDTO";
import { OracleConnection } from "../../../../shared/infra/database/oracle";

export class OracleUsersRepository implements IUsersRepository {
    private connection: OracleConnection;

    constructor() {
        this.connection = OracleConnection.getInstance();
    }

    public async create({ legacy_user_id, name, email, password_hash, roles }: ICreateUserDTO): Promise<IUserDTO> {
        const sql = `
            INSERT INTO AUTH_CREDENTIALS (LEGACY_USER_ID, NAME, EMAIL, PASSWORD_HASH)
            VALUES (:legacy_user_id, :name, :email, :password_hash)
            RETURNING ID, LEGACY_USER_ID, NAME, EMAIL, PASSWORD_HASH, CREATED_AT INTO :id, :l_id, :n, :e, :p, :c
        `;

        const result = await this.connection.execute<any>(sql, {
            legacy_user_id,
            name,
            email,
            password_hash,
            id: { type: 2002, dir: 3003 },
            l_id: { type: 2001, dir: 3003 },
            n: { type: 2001, dir: 3003 },
            e: { type: 2001, dir: 3003 },
            p: { type: 2001, dir: 3003 },
            c: { type: 2004, dir: 3003 }
        }, { autoCommit: true });


        if (roles && roles.length > 0) {
            for (const roleName of roles) {
                await this.connection.execute(
                    `INSERT INTO AUTH_USER_ROLES (USER_ID, ROLE_ID)
                     SELECT :user_id, ID FROM AUTH_ROLES WHERE NAME = :role_name`,
                    { user_id: result.outBinds.id[0], role_name: roleName },
                    { autoCommit: true }
                );
            }
        }

        return this.findByEmail(email) as Promise<IUserDTO>;
    }

    public async findByEmail(email: string): Promise<IUserDTO | undefined> {
        const result = await this.connection.execute<any>(
            `SELECT c.* FROM AUTH_CREDENTIALS c WHERE c.EMAIL = :email`,
            { email }
        );

        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0];

            // Fetch roles
            const rolesResult = await this.connection.execute<any>(
                `SELECT r.NAME FROM AUTH_ROLES r
                 JOIN AUTH_USER_ROLES ur ON ur.ROLE_ID = r.ID
                 WHERE ur.USER_ID = :user_id`,
                { user_id: row.ID }
            );

            const roles = rolesResult.rows?.map((r: any) => r.NAME) || [];

            return {
                id: row.ID,
                legacy_user_id: row.LEGACY_USER_ID,
                name: row.NAME,
                email: row.EMAIL,
                password_hash: row.PASSWORD_HASH,
                created_at: row.CREATED_AT,
                roles
            };
        }

        return undefined;
    }

    public async findById(id: number): Promise<IUserDTO | undefined> {
        const result = await this.connection.execute<any>(
            `SELECT * FROM AUTH_CREDENTIALS WHERE ID = :id`,
            { id }
        );

        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0];

            const rolesResult = await this.connection.execute<any>(
                `SELECT r.NAME FROM AUTH_ROLES r
                 JOIN AUTH_USER_ROLES ur ON ur.ROLE_ID = r.ID
                 WHERE ur.USER_ID = :user_id`,
                { user_id: row.ID }
            );

            const roles = rolesResult.rows?.map((r: any) => r.NAME) || [];

            return {
                id: row.ID,
                legacy_user_id: row.LEGACY_USER_ID,
                name: row.NAME,
                email: row.EMAIL,
                password_hash: row.PASSWORD_HASH,
                created_at: row.CREATED_AT,
                roles
            };
        }

        return undefined;
    }
}
