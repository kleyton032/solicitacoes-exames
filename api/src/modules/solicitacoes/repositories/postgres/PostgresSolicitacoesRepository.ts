import { ISolicitacoesRepository } from '../ISolicitacoesRepository';
import { ISolicitacaoDTO } from '../../dtos/ISolicitacaoDTO';
import { PostgresConnection } from '../../../../shared/infra/database/postgres';

class PostgresSolicitacoesRepository implements ISolicitacoesRepository {
  async findAll(cd_paciente?: number): Promise<ISolicitacaoDTO[]> {
    const db = PostgresConnection.getInstance();
    const client = await db.getClient();

    try {
      const values: any[] = [];

      if (cd_paciente) {
        values.push(cd_paciente);
      }

      const sql = `
          SELECT
            le.cd_paciente,
            p.nr_cpf, 
            p.nr_cns,
            le.cd_it_agend,
            i.ds_item_agendamento,
            le.dt_lanca_lista,
            CASE le.tp_situacao
              WHEN 'A' THEN 'Aguardando'
              WHEN 'G' THEN 'Erro na Marcação'
              WHEN 'T' THEN 'Atendido'
              WHEN 'C' THEN 'Cancelado'
              WHEN 'M' THEN 'Marcado'
              WHEN 'S' THEN 'Solicitado'
              ELSE le.tp_situacao
            END as tp_situacao,
            le.cd_multi_empresa,
            
            -- Subquery 1: item_agendamento_correlato
            (SELECT MIN(iac.hr_agenda) 
             FROM it_agenda_central iac
             JOIN item_agendamento i_ag ON iac.cd_item_agendamento = i_ag.cd_item_agendamento
             WHERE iac.cd_paciente = le.cd_paciente 
               AND iac.hr_agenda >= le.dt_lanca_lista
               AND le.tp_situacao = 'G'
               AND (i_ag.ds_item_agendamento LIKE '%' || SUBSTRING(i.ds_item_agendamento FROM 1 FOR 8) || '%'
                    OR i.ds_item_agendamento LIKE '%' || SUBSTRING(i_ag.ds_item_agendamento FROM 1 FOR 8) || '%')
            ) as item_agendamento_correlato,

            -- Subquery 2: ds_item_agendamento_correlato
            (SELECT ds_item_agendamento 
             FROM (
               SELECT i2.ds_item_agendamento, iac2.cd_paciente, iac2.hr_agenda
               FROM it_agenda_central iac2
               JOIN item_agendamento i2 ON iac2.cd_item_agendamento = i2.cd_item_agendamento
               ORDER BY iac2.hr_agenda ASC
             ) iac_sub
             WHERE iac_sub.cd_paciente = le.cd_paciente
               AND iac_sub.hr_agenda >= le.dt_lanca_lista
               AND le.tp_situacao = 'G'
               AND (iac_sub.ds_item_agendamento LIKE '%' || SUBSTRING(i.ds_item_agendamento FROM 1 FOR 8) || '%'
                    OR i.ds_item_agendamento LIKE '%' || SUBSTRING(iac_sub.ds_item_agendamento FROM 1 FOR 8) || '%')
             LIMIT 1
            ) as ds_item_agendamento_correlato

          FROM
            solicitacoes le
          LEFT JOIN paciente p ON le.cd_paciente = p.cd_paciente
          LEFT JOIN item_agendamento i ON le.cd_it_agend = i.cd_item_agendamento
          WHERE ${values.length > 0 ? 'le.cd_paciente = $1' : '1=1'}
          ORDER BY le.dt_lanca_lista DESC
        `;

      const result = await client.query(sql, values);

      const solicitacoes: ISolicitacaoDTO[] = result.rows.map((row: any) => ({
        cd_paciente: row.cd_paciente,
        nr_cpf: row.nr_cpf,
        nr_cns: row.nr_cns,
        cd_it_agend: row.cd_it_agend,
        tp_situacao: row.tp_situacao,
        ds_item_agendamento: row.ds_item_agendamento,
        dt_lanca_lista: row.dt_lanca_lista,
        item_agendamento_correlato: row.item_agendamento_correlato,
        ds_item_agendamento_correlato: row.ds_item_agendamento_correlato,
        cd_multi_empresa: row.cd_multi_empresa,
      }));

      return solicitacoes;
    } finally {
      client.release();
    }
  }
}

export { PostgresSolicitacoesRepository };
