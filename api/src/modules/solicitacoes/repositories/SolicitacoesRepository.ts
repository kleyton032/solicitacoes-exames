import { OracleConnection } from '../../../shared/infra/database/oracle';
import { ISolicitacoesRepository } from './ISolicitacoesRepository';
import { ISolicitacaoDTO } from '../dtos/ISolicitacaoDTO';

class SolicitacoesRepository implements ISolicitacoesRepository {
    async findAll(): Promise<ISolicitacaoDTO[]> {
        const db = OracleConnection.getInstance();

        const sql = `
      SELECT
        le.cd_paciente,
        p.nr_cpf, 
        p.nr_cns,
        le.cd_it_agend,
        le.tp_situacao,
        le.cd_multi_empresa
      FROM
        fav_lista_espera le,
        paciente p,
        item_agendamento i
      WHERE
        le.cd_paciente = p.cd_paciente
        AND le.cd_it_agend = i.cd_item_agendamento
    `;

        const result = await db.execute<any>(sql);


        const solicitacoes: ISolicitacaoDTO[] = (result.rows || []).map((row: any) => ({
            cd_paciente: row.CD_PACIENTE,
            nr_cpf: row.NR_CPF,
            nr_cns: row.NR_CNS,
            cd_it_agend: row.CD_IT_AGEND,
            tp_situacao: row.TP_SITUACAO,
            cd_multi_empresa: row.CD_MULTI_EMPRESA,
        }));

        return solicitacoes;
    }
}

export { SolicitacoesRepository };
