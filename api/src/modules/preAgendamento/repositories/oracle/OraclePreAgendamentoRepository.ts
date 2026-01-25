import { OracleConnection } from "../../../../shared/infra/database/oracle";
import { IPreAgendamentoDTO } from "../../dtos/IPreAgendamentoDTO";
import { IPreAgendamentoRepository } from "../IPreAgendamentoRepository";

export class OraclePreAgendamentoRepository implements IPreAgendamentoRepository {
    private connection: OracleConnection;

    constructor() {
        this.connection = OracleConnection.getInstance();
    }

    public async findByPaciente(cd_paciente: number): Promise<IPreAgendamentoDTO[]> {
        const sql = `
            SELECT 
                pi.cd_paciente,
                p.nm_paciente,
                pi.cd_pre_internacao,
                p.nr_cpf,
                pi.status,
                c.nm_cidade
            FROM
                pre_internacao pi,
                paciente p,
                cidade c
            WHERE pi.cd_paciente = p.cd_paciente
            AND p.cd_cidade = c.cd_cidade
            AND pi.cd_paciente = :cd_paciente
        `;

        const result = await this.connection.execute<any>(sql, { cd_paciente });

        const preAgendamentos: IPreAgendamentoDTO[] = (result.rows || []).map((row: any) => {
            const normalizedRow: any = {};

            // Normalizar nomes das colunas (Oracle retorna em maiúsculo)
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase()] = row[key];
            });

            // Traduzir status
            const statusMap: { [key: string]: string } = {
                'S': 'SOLICITADO',
                'A': 'CONFIRMADA',
                'N': 'CANCELADO'
            };

            if (normalizedRow.status) {
                normalizedRow.status = statusMap[normalizedRow.status] || normalizedRow.status;
            }

            return normalizedRow as IPreAgendamentoDTO;
        });

        return preAgendamentos;
    }
}
