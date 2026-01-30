import { OracleConnection } from '../../../shared/infra/database/oracle';
import { ISolicitacoesRepository } from './ISolicitacoesRepository';
import { ISolicitacaoDTO } from '../dtos/ISolicitacaoDTO';

class SolicitacoesRepository implements ISolicitacoesRepository {
  async findAll(cd_paciente?: number): Promise<ISolicitacaoDTO[]> {
    const db = OracleConnection.getInstance();
    const binds: any = {};
    let whereClause = `
        le.cd_paciente = p.cd_paciente
        AND le.cd_it_agend = i.cd_item_agendamento
    `;

    if (cd_paciente) {
      whereClause += ' AND le.cd_paciente = :cd_paciente';
      binds.cd_paciente = cd_paciente;
    }

    const sql = `
      SELECT
        le.cd_paciente,
        p.nr_cpf, 
        p.nr_cns,
        le.cd_it_agend,
        i.ds_item_agendamento,
        le.dt_lanca_lista,
        DECODE(le.tp_situacao, 
          'A', 'Aguardando', 
          'G', 'Erro na Marcação',
          'T', 'Atendido', 
          'C', 'Cancelado', 
          'M', 'Marcado', 
          'S', 'Solicitado', 
          le.tp_situacao) as tp_situacao,
        le.cd_multi_empresa,
        (SELECT MIN(iac.hr_agenda) 
         FROM it_agenda_central iac, item_agendamento i_ag
         WHERE iac.cd_paciente = le.cd_paciente 
           AND iac.hr_agenda >= le.dt_lanca_lista
           AND iac.cd_item_agendamento = i_ag.cd_item_agendamento
           AND le.tp_situacao = 'G'
           AND (i_ag.ds_item_agendamento LIKE '%' || SUBSTR(i.ds_item_agendamento, 1, 8) || '%'
                OR i.ds_item_agendamento LIKE '%' || SUBSTR(i_ag.ds_item_agendamento, 1, 8) || '%')
        ) as item_agendamento_correlato,
        (SELECT ds_item_agendamento 
         FROM (
           SELECT i2.ds_item_agendamento, iac2.cd_paciente, iac2.hr_agenda
           FROM it_agenda_central iac2, item_agendamento i2
           WHERE iac2.cd_item_agendamento = i2.cd_item_agendamento
           ORDER BY iac2.hr_agenda ASC
         ) iac_sub
         WHERE iac_sub.cd_paciente = le.cd_paciente
           AND iac_sub.hr_agenda >= le.dt_lanca_lista
           AND le.tp_situacao = 'G'
           AND (iac_sub.ds_item_agendamento LIKE '%' || SUBSTR(i.ds_item_agendamento, 1, 8) || '%'
                OR i.ds_item_agendamento LIKE '%' || SUBSTR(iac_sub.ds_item_agendamento, 1, 8) || '%')
           AND ROWNUM = 1
        ) as ds_item_agendamento_correlato
      FROM
        fav_lista_espera le,
        paciente p,
        item_agendamento i
      WHERE ${whereClause}
      ORDER BY le.dt_lanca_lista DESC
    `;

    const result = await db.execute<any>(sql, binds);


    const solicitacoes: ISolicitacaoDTO[] = (result.rows || []).map((row: any) => ({
      cd_paciente: row.CD_PACIENTE,
      nr_cpf: row.NR_CPF,
      nr_cns: row.NR_CNS,
      cd_it_agend: row.CD_IT_AGEND,
      tp_situacao: row.TP_SITUACAO,
      ds_item_agendamento: row.DS_ITEM_AGENDAMENTO,
      dt_lanca_lista: row.DT_LANCA_LISTA,
      item_agendamento_correlato: row.ITEM_AGENDAMENTO_CORRELATO,
      ds_item_agendamento_correlato: row.DS_ITEM_AGENDAMENTO_CORRELATO,
      cd_multi_empresa: row.CD_MULTI_EMPRESA,
    }));

    return solicitacoes;
  }
}

export { SolicitacoesRepository };
