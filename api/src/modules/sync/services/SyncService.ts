import { PostgresConnection } from '../../../shared/infra/database/postgres';

interface ISyncData {
    roles: any[];
    users: any[];
    userRoles: any[];
    pacientes: any[];
    items: any[];
    agendaCentral: any[];
    solicitacoes: any[];
}

export class SyncService {
    async execute(data: ISyncData): Promise<void> {
        const db = PostgresConnection.getInstance();
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // --- 1. ROLES ---
            if (data.roles?.length) {
                for (const r of data.roles) {
                    await client.query(`
                        INSERT INTO roles (id, name, description) VALUES ($1, $2, $3)
                        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
                    `, [r.ID, r.NAME, r.DESCRIPTION]);
                }
            }

            // --- 2. USERS ---
            if (data.users?.length) {
                for (const u of data.users) {
                    await client.query(`
                        INSERT INTO users (id, legacy_user_id, name, email, password_hash, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (legacy_user_id) DO UPDATE SET
                            name = EXCLUDED.name,
                            email = EXCLUDED.email,
                            password_hash = EXCLUDED.password_hash
                    `, [u.ID, u.LEGACY_USER_ID, u.NAME, u.EMAIL, u.PASSWORD_HASH, u.CREATED_AT]);
                }
            }

            // --- 3. USER_ROLES ---
            if (data.userRoles?.length) {
                for (const ur of data.userRoles) {
                    await client.query(`
                        INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)
                        ON CONFLICT (user_id, role_id) DO NOTHING
                    `, [ur.USER_ID, ur.ROLE_ID]);
                }
            }

            // --- 4. PACIENTE ---
            if (data.pacientes?.length) {
                for (const p of data.pacientes) {
                    const cols = [
                        'cd_paciente', 'cd_cidade', 'cd_dis_san', 'tp_situacao', 'nm_mnemonico', 'nm_paciente', 'tp_sexo', 'tp_estado_civil',
                        'cd_cidade_tem', 'ds_endereco', 'dt_cadastro', 'dt_nascimento', 'tp_cor', 'nm_mae', 'cd_cla_eco', 'cd_cidadania',
                        'cd_tip_mor', 'cd_tip_res', 'cd_grau_ins', 'cd_religiao', 'cd_profissao', 'nr_cep', 'nr_documento', 'hr_cadastro',
                        'nr_fone', 'nm_bairro', 'nm_pai', 'cd_dis_san_muitos', 'ds_trabalho', 'nm_conjuge', 'tp_sanguineo', 'sn_doador',
                        'ds_checapac', 'nm_usuario', 'cd_cns', 'nr_cns', 'nr_cpf', 'ds_complemento', 'nr_endereco', 'nr_rg_nasc', 'nr_identidade',
                        'ds_om_identidade', 'ds_observacao', 'cd_paciente_antigo', 'dt_ultima_atualizacao', 'cd_naturalidade', 'cd_multi_empresa',
                        'ds_atributo1', 'sn_alt_dados_ora_app', 'email', 'dt_inativo', 'cd_pis_pasep', 'tp_certidao', 'nm_cartorio', 'ds_livro',
                        'ds_folha', 'dt_emissao_certidao', 'dt_emissao_identidade', 'cd_uf_emissao_identidade', 'dt_entrada_estrangeiro',
                        'nr_ctps', 'nr_serie_ctps', 'dt_emissao_ctps', 'cd_uf_emissao_ctps', 'nr_titulo_eleitoral', 'nr_zona_titulo_eleitoral',
                        'nr_secao_titulo_eleitoral', 'sn_recebe_contato', 'cd_paciente_integra', 'cd_seq_integra', 'dt_integra',
                        'cd_tipo_logradouro', 'sn_permite_agendar_para_sus', 'cd_categoria_opiniao', 'sn_vip', 'cd_pais', 'cd_paciente_externo',
                        'cd_etnia', 'ds_hash', 'nr_documento_estrangeiro', 'dt_entrada_brasil', 'dt_naturalizacao', 'nr_portaria_naturalizacao',
                        'nr_ddd_fone', 'nr_ddd_celular', 'nr_celular', 'nr_ddi_fone', 'nr_ddi_celular', 'nr_ddi_fone_comercial', 'nr_ddd_fone_comercial',
                        'nr_fone_comercial', 'sn_notificacao_sms', 'sn_utiliza_nome_social', 'nm_social_paciente', 'cd_identificador_pessoa',
                        'sn_endereco_sem_numero', 'cd_banco', 'nr_agencia', 'ds_agencia', 'nr_conta', 'sn_frequenta_escola', 'ds_cargo_trabalho',
                        'nr_registro_funcional_trabalho', 'ds_vinclulo_trabalho', 'ds_horario_trabalho', 'tp_paciente', 'cd_tip_paren',
                        'ds_complemento_tutor', 'nm_tutor', 'dt_nascimento_tutor', 'tp_sexo_tutor', 'nr_cpf_tutor'
                    ];

                    const values = [
                        p.CD_PACIENTE, p.CD_CIDADE, p.CD_DIS_SAN, p.TP_SITUACAO, p.NM_MNEMONICO, p.NM_PACIENTE, p.TP_SEXO, p.TP_ESTADO_CIVIL,
                        p.CD_CIDADE_TEM, p.DS_ENDERECO, p.DT_CADASTRO, p.DT_NASCIMENTO, p.TP_COR, p.NM_MAE, p.CD_CLA_ECO, p.CD_CIDADANIA,
                        p.CD_TIP_MOR, p.CD_TIP_RES, p.CD_GRAU_INS, p.CD_RELIGIAO, p.CD_PROFISSAO, p.NR_CEP, p.NR_DOCUMENTO, p.HR_CADASTRO,
                        p.NR_FONE, p.NM_BAIRRO, p.NM_PAI, p.CD_DIS_SAN_MUITOS, p.DS_TRABALHO, p.NM_CONJUGE, p.TP_SANGUINEO, p.SN_DOADOR,
                        p.DS_CHECAPAC, p.NM_USUARIO, p.CD_CNS, p.NR_CNS, p.NR_CPF, p.DS_COMPLEMENTO, p.NR_ENDERECO, p.NR_RG_NASC, p.NR_IDENTIDADE,
                        p.DS_OM_IDENTIDADE, p.DS_OBSERVACAO, p.CD_PACIENTE_ANTIGO, p.DT_ULTIMA_ATUALIZACAO, p.CD_NATURALIDADE, p.CD_MULTI_EMPRESA,
                        p.DS_ATRIBUTO1, p.SN_ALT_DADOS_ORA_APP, p.EMAIL, p.DT_INATIVO, p.CD_PIS_PASEP, p.TP_CERTIDAO, p.NM_CARTORIO, p.DS_LIVRO,
                        p.DS_FOLHA, p.DT_EMISSAO_CERTIDAO, p.DT_EMISSAO_IDENTIDADE, p.CD_UF_EMISSAO_IDENTIDADE, p.DT_ENTRADA_ESTRANGEIRO,
                        p.NR_CTPS, p.NR_SERIE_CTPS, p.DT_EMISSAO_CTPS, p.CD_UF_EMISSAO_CTPS, p.NR_TITULO_ELEITORAL, p.NR_ZONA_TITULO_ELEITORAL,
                        p.NR_SECAO_TITULO_ELEITORAL, p.SN_RECEBE_CONTATO, p.CD_PACIENTE_INTEGRA, p.CD_SEQ_INTEGRA, p.DT_INTEGRA,
                        p.CD_TIPO_LOGRADOURO, p.SN_PERMITE_AGENDAR_PARA_SUS, p.CD_CATEGORIA_OPINIAO, p.SN_VIP, p.CD_PAIS, p.CD_PACIENTE_EXTERNO,
                        p.CD_ETNIA, p.DS_HASH, p.NR_DOCUMENTO_ESTRANGEIRO, p.DT_ENTRADA_BRASIL, p.DT_NATURALIZACAO, p.NR_PORTARIA_NATURALIZACAO,
                        p.NR_DDD_FONE, p.NR_DDD_CELULAR, p.NR_CELULAR, p.NR_DDI_FONE, p.NR_DDI_CELULAR, p.NR_DDI_FONE_COMERCIAL, p.NR_DDD_FONE_COMERCIAL,
                        p.NR_FONE_COMERCIAL, p.SN_NOTIFICACAO_SMS, p.SN_UTILIZA_NOME_SOCIAL, p.NM_SOCIAL_PACIENTE, p.CD_IDENTIFICADOR_PESSOA,
                        p.SN_ENDERECO_SEM_NUMERO, p.CD_BANCO, p.NR_AGENCIA, p.DS_AGENCIA, p.NR_CONTA, p.SN_FREQUENTA_ESCOLA, p.DS_CARGO_TRABALHO,
                        p.NR_REGISTRO_FUNCIONAL_TRABALHO, p.DS_VINCLULO_TRABALHO, p.DS_HORARIO_TRABALHO, p.TP_PACIENTE, p.CD_TIP_PAREN,
                        p.DS_COMPLEMENTO_TUTOR, p.NM_TUTOR, p.DT_NASCIMENTO_TUTOR, p.TP_SEXO_TUTOR, p.NR_CPF_TUTOR
                    ];


                    // Regex para identificar unificação: "PRONTUÁRIO UNIFICADO DE 123456 PARA 12345678"
                    if (p.DS_OBSERVACAO) {
                        const match = p.DS_OBSERVACAO.match(/PRONTUÁRIO UNIFICADO DE (\d+) PARA (\d+)/);
                        if (match) {
                            const oldId = parseInt(match[1]);
                            const newId = parseInt(match[2]);

                            console.log(`[SYNC] Detectada unificação: ${oldId} -> ${newId}`);

                            // 1. Log na tabela de histórico
                            await client.query(`
                               INSERT INTO log_unificacao_paciente (cd_paciente_antigo, cd_paciente_novo, ds_observacao)
                               VALUES ($1, $2, $3)
                           `, [oldId, newId, p.DS_OBSERVACAO]);

                            // 2. Remove o paciente antigo (Se existir no Postgres)
                            await client.query(`DELETE FROM paciente WHERE cd_paciente = $1`, [oldId]);
                        }
                    }

                    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
                    const columns = cols.join(', ');

                    // Lógica simples de Upsert: Atualize alguns campos-chave em caso de conflito para manter a operação ativa
                    await client.query(`
                        INSERT INTO paciente (${columns}) VALUES (${placeholders})
                        ON CONFLICT (cd_paciente) DO UPDATE SET
                            nm_paciente = EXCLUDED.nm_paciente,
                            nr_cpf = EXCLUDED.nr_cpf,
                            ds_observacao = EXCLUDED.ds_observacao,
                            tp_situacao = EXCLUDED.tp_situacao,
                            dt_inativo = EXCLUDED.dt_inativo,
                            nm_mae = EXCLUDED.nm_mae,
                            tp_sexo = EXCLUDED.tp_sexo,
                            dt_nascimento = EXCLUDED.dt_nascimento,
                            ds_endereco = EXCLUDED.ds_endereco,
                            nr_endereco = EXCLUDED.nr_endereco,
                            ds_complemento = EXCLUDED.ds_complemento,
                            nm_bairro = EXCLUDED.nm_bairro,
                            nr_cep = EXCLUDED.nr_cep,
                            cd_cidade = EXCLUDED.cd_cidade,
                            nr_fone = EXCLUDED.nr_fone,
                            nr_celular = EXCLUDED.nr_celular,
                            email = EXCLUDED.email,
                            nr_rg_nasc = EXCLUDED.nr_rg_nasc,
                            nm_social_paciente = EXCLUDED.nm_social_paciente,
                            tp_estado_civil = EXCLUDED.tp_estado_civil,
                            tp_cor = EXCLUDED.tp_cor,
                            nm_pai = EXCLUDED.nm_pai,
                            nm_conjuge = EXCLUDED.nm_conjuge,
                            ds_trabalho = EXCLUDED.ds_trabalho,
                            cd_profissao = EXCLUDED.cd_profissao,
                            cd_religiao = EXCLUDED.cd_religiao,
                            cd_grau_ins = EXCLUDED.cd_grau_ins,
                            nr_cns = EXCLUDED.nr_cns,
                            dt_ultima_atualizacao = CURRENT_TIMESTAMP
                    `, values);
                }
            }

            // --- 5. ITEM_AGENDAMENTO ---
            if (data.items?.length) {
                for (const i of data.items) {
                    await client.query(`
                        INSERT INTO item_agendamento (
                            cd_item_agendamento, ds_item_agendamento, tp_item, cd_exa_lab, cd_exa_rx, cd_pro_fat, cd_ssm,
                            hr_realizacao, sn_ativo, sn_checa_guia, ds_mnemonico, cd_procedimento_sia, sn_sugere_alt_tempo_anestesia
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        ON CONFLICT (cd_item_agendamento) DO UPDATE SET
                            ds_item_agendamento = EXCLUDED.ds_item_agendamento
                    `, [
                        i.CD_ITEM_AGENDAMENTO, i.DS_ITEM_AGENDAMENTO, i.TP_ITEM, i.CD_EXA_LAB, i.CD_EXA_RX, i.CD_PRO_FAT, i.CD_SSM,
                        i.HR_REALIZACAO, i.SN_ATIVO, i.SN_CHECA_GUIA, i.DS_MNEMONICO, i.CD_PROCEDIMENTO_SIA, i.SN_SUGERE_ALT_TEMPO_ANESTESIA
                    ]);
                }
            }

            // --- 5.1 ITEM AGENDAMENTO ---
            if (data.items?.length) {
                for (const item of data.items) {
                    await client.query(`
                        INSERT INTO item_agendamento (
                            cd_item_agendamento, ds_item_agendamento, tp_item, cd_exa_lab, cd_exa_rx, 
                            cd_pro_fat, cd_ssm, hr_realizacao, sn_ativo, sn_checa_guia, 
                            ds_mnemonico, cd_procedimento_sia, sn_sugere_alt_tempo_anestesia
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                        )
                        ON CONFLICT (cd_item_agendamento) DO UPDATE SET
                            ds_item_agendamento = EXCLUDED.ds_item_agendamento,
                            tp_item = EXCLUDED.tp_item,
                            sn_ativo = EXCLUDED.sn_ativo
                    `, [
                        item.CD_ITEM_AGENDAMENTO, item.DS_ITEM_AGENDAMENTO, item.TP_ITEM, item.CD_EXA_LAB, item.CD_EXA_RX,
                        item.CD_PRO_FAT, item.CD_SSM, item.HR_REALIZACAO, item.SN_ATIVO, item.SN_CHECA_GUIA,
                        item.DS_MNEMONICO, item.CD_PROCEDIMENTO_SIA, item.SN_SUGERE_ALT_TEMPO_ANESTESIA
                    ]);
                }
            }

            // --- 6. IT_AGENDA_CENTRAL ---
            if (data.agendaCentral?.length) {
                for (const a of data.agendaCentral) {
                    await client.query(`
                        INSERT INTO it_agenda_central (
                             cd_agenda_central, hr_agenda, cd_paciente, nm_paciente, vl_altura, qt_peso, dt_nascimento, sn_atendido,
                             sn_encaixe, cd_grupo_agenda, cd_atendimento, cd_gru_ate, cd_item_agendamento, cd_usuario, cd_convenio,
                             cd_con_pla, cd_ser_dis, cd_tip_mar, tp_situacao, vl_perc_desconto, vl_negociado, sn_anestesista, sn_publico,
                             sn_bloqueado, nr_fone, cd_anestesista, ds_observacao, cd_it_agenda_central, cd_it_agenda_pai, tp_sexo,
                             cd_solic_agendamento, cd_atendimento_pai, ds_senha_painel, sn_dispensa_equipamentos, dt_gravacao, ds_email,
                             cd_agenda_fila_espera, sn_agenda_faturada, ds_observacao_geral, sn_sessao, nr_sessao_scma,
                             vl_tempo_realizacao_informado, hr_fim, cd_it_agenda_central_integra, cd_seq_integra, dt_integra,
                             dh_presenca_falta, tp_presenca_falta, cd_usuario_presenca_falta, sn_encaixe_extra, nr_celular,
                             nr_ddi_telefone, nr_ddd_celular, nr_ddi_celular, nr_id_envio_sms, nr_ddd_fone, cd_movimento_pactuacao,
                             cd_log_opera_agenda
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
                            $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58
                        )
                        ON CONFLICT (cd_it_agenda_central) DO UPDATE SET tp_situacao = EXCLUDED.tp_situacao
                    `, [
                        a.CD_AGENDA_CENTRAL, a.HR_AGENDA, a.CD_PACIENTE, a.NM_PACIENTE, a.VL_ALTURA, a.QT_PESO, a.DT_NASCIMENTO,
                        a.SN_ATENDIDO, a.SN_ENCAIXE, a.CD_GRUPO_AGENDA, a.CD_ATENDIMENTO, a.CD_GRU_ATE, a.CD_ITEM_AGENDAMENTO,
                        a.CD_USUARIO, a.CD_CONVENIO, a.CD_CON_PLA, a.CD_SER_DIS, a.CD_TIP_MAR, a.TP_SITUACAO, a.VL_PERC_DESCONTO,
                        a.VL_NEGOCIADO, a.SN_ANESTESISTA, a.SN_PUBLICO, a.SN_BLOQUEADO, a.NR_FONE, a.CD_ANESTESISTA, a.DS_OBSERVACAO,
                        a.CD_IT_AGENDA_CENTRAL, a.CD_IT_AGENDA_PAI, a.TP_SEXO, a.CD_SOLIC_AGENDAMENTO, a.CD_ATENDIMENTO_PAI,
                        a.DS_SENHA_PAINEL, a.SN_DISPENSA_EQUIPAMENTOS, a.DT_GRAVACAO, a.DS_EMAIL, a.CD_AGENDA_FILA_ESPERA,
                        a.SN_AGENDA_FATURADA, a.DS_OBSERVACAO_GERAL, a.SN_SESSAO, a.NR_SESSAO_SCMA, a.VL_TEMPO_REALIZACAO_INFORMADO,
                        a.HR_FIM, a.CD_IT_AGENDA_CENTRAL_INTEGRA, a.CD_SEQ_INTEGRA, a.DT_INTEGRA, a.DH_PRESENCA_FALTA,
                        a.TP_PRESENCA_FALTA, a.CD_USUARIO_PRESENCA_FALTA, a.SN_ENCAIXE_EXTRA, a.NR_CELULAR, a.NR_DDI_TELEFONE,
                        a.NR_DDD_CELULAR, a.NR_DDI_CELULAR, a.NR_ID_ENVIO_SMS, a.NR_DDD_FONE, a.CD_MOVIMENTO_PACTUACAO,
                        a.CD_LOG_OPERA_AGENDA
                    ]);
                }
            }


            // --- 7. SOLICITACOES (FAV_LISTA_ESPERA) ---
            if (data.solicitacoes?.length) {
                for (const s of data.solicitacoes) {
                    await client.query(`
                        INSERT INTO solicitacoes (
                            cd_lista_espera, cd_paciente, cd_it_agend, cd_atendimento, cd_procedimento,
                            dt_atendimento, cd_prestador, cd_ori_ate, cd_convenio, cd_multi_empresa,
                            olho, tp_situacao, observ, dt_agendamento, dt_marcacao,
                            cd_it_agenda_central, nm_usuario_marc, dt_realizacao, dt_lanca_lista,
                            cd_atendimento_r, sn_encaixe, cd_documento, cd_priori, ds_priori,
                            cd_usuario_edit, cd_perg_od, cd_perg_oe, cd_id_fila, dt_retorno,
                            sn_cota, resposta_retorno, cer_periodic, cer_tp_grup, cer_qt_grup,
                            cer_tot_ses, cer_sessao,
                            ds_item_agendamento, item_agendamento_correlato, ds_item_agendamento_correlato
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                            $31, $32, $33, $34, $35, $36,
                            $37, $38, $39
                        )
                        ON CONFLICT (cd_lista_espera) DO UPDATE SET
                            cd_paciente = EXCLUDED.cd_paciente,
                            cd_it_agend = EXCLUDED.cd_it_agend,
                            tp_situacao = EXCLUDED.tp_situacao,
                            updated_at = CURRENT_TIMESTAMP
                     `, [
                        s.CD_LISTA_ESPERA, s.CD_PACIENTE, s.CD_IT_AGEND, s.CD_ATENDIMENTO, s.CD_PROCEDIMENTO,
                        s.DT_ATENDIMENTO, s.CD_PRESTADOR, s.CD_ORI_ATE, s.CD_CONVENIO, s.CD_MULTI_EMPRESA,
                        s.OLHO, s.TP_SITUACAO, s.OBSERV, s.DT_AGENDAMENTO, s.DT_MARCACAO,
                        s.CD_IT_AGENDA_CENTRAL, s.NM_USUARIO_MARC, s.DT_REALIZACAO, s.DT_LANCA_LISTA,
                        s.CD_ATENDIMENTO_R, s.SN_ENCAIXE, s.CD_DOCUMENTO, s.CD_PRIORI, s.DS_PRIORI,
                        s.CD_USUARIO_EDIT, s.CD_PERG_OD, s.CD_PERG_OE, s.CD_ID_FILA, s.DT_RETORNO,
                        s.SN_COTA, s.RESPOSTA_RETORNO, s.CER_PERIODIC, s.CER_TP_GRUP, s.CER_QT_GRUP,
                        s.CER_TOT_SES, s.CER_SESSAO,
                        s.DS_ITEM_AGENDAMENTO, s.ITEM_AGENDAMENTO_CORRELATO, s.DS_ITEM_AGENDAMENTO_CORRELATO
                    ]);
                }
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async saveLog(log: { status: string; message: string; payload_summary?: string }): Promise<void> {
        const db = PostgresConnection.getInstance();
        const client = await db.getClient();
        try {
            await client.query(`
                INSERT INTO sync_logs (status, message, payload_summary)
                VALUES ($1, $2, $3)
            `, [log.status, log.message, log.payload_summary]);
        } catch (err) {
            console.error('Failed to save log', err);
        } finally {
            client.release();
        }
    }
}
