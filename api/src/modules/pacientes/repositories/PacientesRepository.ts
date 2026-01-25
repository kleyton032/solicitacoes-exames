import { OracleConnection } from '../../../shared/infra/database/oracle';
import { IPacientesRepository, ISearchPacienteFilter } from './IPacientesRepository';
import { IPacienteDTO } from '../dtos/IPacienteDTO';

class PacientesRepository implements IPacientesRepository {
    async findByFilter({ cd_paciente, nr_cpf }: ISearchPacienteFilter): Promise<IPacienteDTO[]> {
        const db = OracleConnection.getInstance();
        const binds: any = {};
        const conditions: string[] = [];

        if (cd_paciente) {
            conditions.push('cd_paciente = :cd_paciente');
            binds.cd_paciente = cd_paciente;
        }

        if (nr_cpf) {
            // Remove possible formatting from CPF before searching
            const cleanCpf = nr_cpf.replace(/\D/g, '');
            conditions.push('nr_cpf = :nr_cpf');
            binds.nr_cpf = cleanCpf;
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
      FROM
        paciente
      WHERE ${conditions.join(' AND ')}
    `;

        const result = await db.execute<any>(sql, binds);

        const pacientes: IPacienteDTO[] = (result.rows || []).map((row: any) => ({
            cd_paciente: row.CD_PACIENTE,
            nm_paciente: row.NM_PACIENTE,
            nr_cpf: row.NR_CPF,
            dt_nascimento: row.DT_NASCIMENTO,
            nr_cns: row.NR_CNS,
        }));

        return pacientes;
    }
}

export { PacientesRepository };
