import { IPacientesRepository, ISearchPacienteFilter } from '../IPacientesRepository';
import { IPacienteDTO } from '../../dtos/IPacienteDTO';
import { PostgresConnection } from '../../../../shared/infra/database/postgres';

class PostgresPacientesRepository implements IPacientesRepository {
    async findByFilter({ cd_paciente, nr_cpf }: ISearchPacienteFilter): Promise<IPacienteDTO[]> {
        const db = PostgresConnection.getInstance();
        const client = await db.getClient();

        try {
            const conditions: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (cd_paciente) {
                conditions.push(`cd_paciente = $${paramIndex}`);
                values.push(cd_paciente);
                paramIndex++;
            }

            if (nr_cpf) {
                const cleanCpf = nr_cpf.replace(/\D/g, '');
                conditions.push(`nr_cpf = $${paramIndex}`);
                values.push(cleanCpf);
                paramIndex++;
            }

            if (conditions.length === 0) {
                return [];
            }

            const sql = `
                SELECT
                    cd_paciente,
                    nm_paciente,
                    nr_cpf,
                    dt_nascimento,
                    nr_cns
                FROM paciente
                WHERE ${conditions.join(' AND ')}
            `;

            const result = await client.query(sql, values);

            const pacientes: IPacienteDTO[] = result.rows.map((row: any) => ({
                cd_paciente: row.cd_paciente,
                nm_paciente: row.nm_paciente,
                nr_cpf: row.nr_cpf,
                dt_nascimento: row.dt_nascimento,
                nr_cns: row.nr_cns,
            }));

            return pacientes;

        } finally {
            client.release();
        }
    }
}

export { PostgresPacientesRepository };
