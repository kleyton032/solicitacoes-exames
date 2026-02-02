const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Configuração
const envPath = path.resolve(__dirname, '../api/.env.db');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const ORACLE_USER = process.env.ORACLE_USER;
const ORACLE_PASSWORD = process.env.ORACLE_PASSWORD;
const ORACLE_CONNECTION_STRING = process.env.ORACLE_CONNECTION;
const API_URL = 'http://localhost:3333/sync/data';
const LOG_URL = 'http://localhost:3333/sync/log';
const API_KEY = process.env.SYNC_API_KEY;

// --- Auxiliar para Logs ---
const sendLog = async (status: 'SUCCESS' | 'ERROR' | 'INFO', message: string, summary?: string) => {
    try {
        await axios.post(LOG_URL, {
            status,
            message,
            payload_summary: summary
        }, {
            headers: { 'x-sync-key': API_KEY }
        });
    } catch (err: any) {
        console.error('  [AVISO] Falha ao enviar log para API:', err.message);
    }
};

// --- CONFIGURAÇÃO (FLAGS PARA TESTE) ---
const ENABLE_AUTH = false;           // Tabela de Usuários e Roles
const ENABLE_PACIENTES = true;      // Tabela Pai
const ENABLE_ITEMS = false;          // Dependência de Agenda e Solicitações
const ENABLE_AGENDA = false;        // Depende de Paciente
const ENABLE_SOLICITACOES = false;  // Depende de Paciente e Agenda

// Configuração do range de anos (PARA TESTE: APENAS 2024)
const START_YEAR = 2011;
const END_YEAR = 2011;

// --- Auxiliar para Envio em Lotes (Escopo externo) ---
const sendInChunks = async (data: any[], type: string) => {
    if (!data || data.length === 0) return;

    const CHUNK_SIZE = 500;
    console.log(`Enviando ${data.length} ${type} em lotes de ${CHUNK_SIZE}...`);

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        const batchNum = Math.floor(i / CHUNK_SIZE) + 1;
        const totalBatches = Math.ceil(data.length / CHUNK_SIZE);

        console.log(`  > Enviando ${type} Lote ${batchNum}/${totalBatches} (${chunk.length} itens)...`);

        // Construir payload apenas para este lote
        const payload = {
            roles: type === 'ROLES' ? chunk : [],
            users: type === 'USERS' ? chunk : [],
            userRoles: type === 'USER_ROLES' ? chunk : [],
            items: type === 'ITEMS' ? chunk : [],
            pacientes: type === 'PACIENTES' ? chunk : [],
            agendaCentral: type === 'AGENDA' ? chunk : [],
            solicitacoes: type === 'SOLICITACOES' ? chunk : []
        };

        let attempts = 0;
        const MAX_RETRIES = 3;
        let success = false;

        while (attempts < MAX_RETRIES && !success) {
            attempts++;
            try {
                await axios.post(API_URL, payload, {
                    headers: {
                        'x-sync-key': API_KEY,
                        'Content-Type': 'application/json'
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                });
                success = true;
            } catch (err: any) {
                console.error(`  [AVISO] Tentativa ${attempts}/${MAX_RETRIES} falhou para o Lote ${batchNum}:`, err.message);
                if (err.code === 'ECONNRESET' || err.response?.status >= 500) {
                    await new Promise(res => setTimeout(res, 2000));
                } else {
                    if (err.response && err.response.data) {
                        const errMsg = JSON.stringify(err.response.data, null, 2);
                        console.error('  [RESPOSTA DO SERVIDOR]:', errMsg);
                        await sendLog('ERROR', `Falha no Backfill (${type}) Lote ${batchNum}`, errMsg);
                    }
                    break;
                }
            }
        }

        if (success) {
            await sendLog('SUCCESS', `Backfill (${type}) Lote ${batchNum}/${totalBatches} OK`, `${chunk.length} itens enviados.`);
        } else {
            const msg = `Falha ao sincronizar ${type} Lote ${batchNum} após ${MAX_RETRIES} tentativas.`;
            console.error(`  [ERRO] ${msg}`);
            await sendLog('ERROR', msg);
        }
    }
    console.log(`[OK] Todos os lotes de ${type} enviados.`);
};

async function syncAuth(connection: any) {
    if (!ENABLE_AUTH) return;

    console.log('\n=== Processando Autenticação (Users/Roles) ===');

    // 1. Roles
    console.log('Buscando Roles...');
    const roles = await connection.execute('SELECT ID, NAME, DESCRIPTION FROM AUTH_ROLES');
    if (roles.rows?.length) {
        await sendInChunks(roles.rows, 'ROLES');
    }

    // 2. Users
    console.log('Buscando Usuários...');
    const users = await connection.execute('SELECT ID, LEGACY_USER_ID, NAME, EMAIL, PASSWORD_HASH, CREATED_AT FROM AUTH_CREDENTIALS');
    if (users.rows?.length) {
        await sendInChunks(users.rows, 'USERS');
    }

    // 3. User Roles
    console.log('Buscando Vínculos (User Roles)...');
    const userRoles = await connection.execute('SELECT USER_ID, ROLE_ID FROM AUTH_USER_ROLES');
    if (userRoles.rows?.length) {
        await sendInChunks(userRoles.rows, 'USER_ROLES');
    }
}

// Usar 'any' para evitar erros de TS na conexão
async function syncYear(connection: any, year: number) {
    console.log(`\n=== Processando Ano: ${year} ===`);

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    let pacientesRows: any[] = [];
    let itemsRows: any[] = [];
    let agendaRows: any[] = [];
    let solicitacoesRows: any[] = [];

    // --- 1. PACIENTES ---
    if (ENABLE_PACIENTES) {
        console.log(`Buscando Pacientes para ${year}...`);
        const result = await connection.execute(`
            SELECT 
                cd_paciente, cd_cidade, cd_dis_san, tp_situacao, nm_mnemonico, nm_paciente, tp_sexo, tp_estado_civil,
                cd_cidade_tem, ds_endereco, dt_cadastro, dt_nascimento, tp_cor, nm_mae, cd_cla_eco, cd_cidadania,
                cd_tip_mor, cd_tip_res, cd_grau_ins, cd_religiao, cd_profissao, nr_cep, nr_documento, hr_cadastro,
                nr_fone, nm_bairro, nm_pai, cd_dis_san_muitos, ds_trabalho, nm_conjuge, tp_sanguineo, sn_doador,
                ds_checapac, nm_usuario, cd_cns, nr_cns, nr_cpf, ds_complemento, nr_endereco, nr_rg_nasc, nr_identidade,
                ds_om_identidade, ds_observacao, cd_paciente_antigo, dt_ultima_atualizacao, cd_naturalidade, cd_multi_empresa,
                ds_atributo1, sn_alt_dados_ora_app, email, dt_inativo, cd_pis_pasep, tp_certidao, nm_cartorio, ds_livro,
                ds_folha, dt_emissao_certidao, dt_emissao_identidade, cd_uf_emissao_identidade, dt_entrada_estrangeiro,
                nr_ctps, nr_serie_ctps, dt_emissao_ctps, cd_uf_emissao_ctps, nr_titulo_eleitoral, nr_zona_titulo_eleitoral,
                nr_secao_titulo_eleitoral, sn_recebe_contato, cd_paciente_integra, cd_seq_integra, dt_integra,
                cd_tipo_logradouro, sn_permite_agendar_para_sus, cd_categoria_opiniao, sn_vip, cd_pais, cd_paciente_externo,
                cd_etnia, ds_hash, nr_documento_estrangeiro, dt_entrada_brasil, dt_naturalizacao, nr_portaria_naturalizacao,
                nr_ddd_fone, nr_ddd_celular, nr_celular, nr_ddi_fone, nr_ddi_celular, nr_ddi_fone_comercial, nr_ddd_fone_comercial,
                nr_fone_comercial, sn_notificacao_sms, sn_utiliza_nome_social, nm_social_paciente, cd_identificador_pessoa,
                sn_endereco_sem_numero, cd_banco, nr_agencia, ds_agencia, nr_conta, sn_frequenta_escola, ds_cargo_trabalho,
                nr_registro_funcional_trabalho, ds_vinclulo_trabalho, ds_horario_trabalho, tp_paciente, cd_tip_paren,
                ds_complemento_tutor, nm_tutor, dt_nascimento_tutor, tp_sexo_tutor, nr_cpf_tutor
            FROM PACIENTE 
            WHERE dt_cadastro >= :startDate AND dt_cadastro <= :endDate
        `, { startDate, endDate }, { resultSet: true }); // Habilitar streaming

        const rs = result.resultSet;
        let batchCount = 0;
        let totalProcessed = 0;

        try {
            while (true) {
                const rows = await rs.getRows(500); // Buscar 500 linhas por vez
                if (!rows || rows.length === 0) {
                    break;
                }

                batchCount++;
                totalProcessed += rows.length;
                console.log(`  > Processando Pacientes Lote ${batchCount} (${rows.length} itens) - Total: ${totalProcessed}...`);

                // Enviar imediatamente
                await sendInChunks(rows, 'PACIENTES');
            }
        } finally {
            await rs.close();
        }
        console.log(`> Finalizado Pacientes: ${totalProcessed} itens processados.`);
    }

    // --- 1.1 ITEM AGENDAMENTO ---
    if (ENABLE_ITEMS) {
        console.log(`Buscando Itens de Agendamento...`);
        const result = await connection.execute(`
            SELECT 
                cd_item_agendamento, ds_item_agendamento, tp_item, cd_exa_lab, cd_exa_rx, cd_pro_fat, cd_ssm,
                hr_realizacao, sn_ativo, sn_checa_guia, ds_mnemonico, cd_procedimento_sia, sn_sugere_alt_tempo_anestesia
            FROM ITEM_AGENDAMENTO
            WHERE ROWNUM <= 5000 
        `);

        if (result.rows) {
            itemsRows = result.rows;
        }
        console.log(`> Encontrados ${itemsRows.length} Itens de Agendamento.`);
    }

    // --- 2. AGENDA CENTRAL ---
    if (ENABLE_AGENDA) {
        console.log(`Buscando Agendas para ${year}...`);

        const result = await connection.execute(`
            SELECT 
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
            FROM IT_AGENDA_CENTRAL 
            WHERE hr_agenda >= :startDate AND hr_agenda <= :endDate
        `, { startDate, endDate }, { resultSet: true }); // Habilitar streaming

        const rs = result.resultSet;
        let batchCount = 0;
        let totalProcessed = 0;

        try {
            while (true) {
                const rows = await rs.getRows(500); // Buscar 500 linhas por vez
                if (!rows || rows.length === 0) {
                    break;
                }

                batchCount++;
                totalProcessed += rows.length;
                console.log(`  > Processando Agenda Lote ${batchCount} (${rows.length} itens) - Total: ${totalProcessed}...`);

                // Enviar imediatamente
                await sendInChunks(rows, 'AGENDA');
            }
        } finally {
            await rs.close();
        }
        console.log(`> Finalizado Agendas: ${totalProcessed} itens processados.`);
    }

    // --- 3. SOLICITACOES ---
    if (ENABLE_SOLICITACOES) {
        console.log(`Buscando Solicitações para ${year}...`);
        const result = await connection.execute(`
             SELECT
                le.cd_lista_espera, le.cd_paciente, le.cd_it_agend, le.cd_atendimento, le.cd_procedimento, le.dt_atendimento,
                le.cd_prestador, le.cd_ori_ate, le.cd_convenio, le.cd_multi_empresa, le.olho, le.tp_situacao, le.observ,
                le.dt_agendamento, le.dt_marcacao, le.cd_it_agenda_central, le.nm_usuario_marc, le.dt_realizacao, le.dt_lanca_lista,
                le.cd_atendimento_r, le.sn_encaixe, le.cd_documento, le.cd_priori, le.ds_priori, le.cd_usuario_edit,
                le.cd_perg_od, le.cd_perg_oe, le.cd_id_fila, le.dt_retorno, le.sn_cota, le.resposta_retorno, le.cer_periodic,
                le.cer_tp_grup, le.cer_qt_grup, le.cer_tot_ses, le.cer_sessao,
                
                i.ds_item_agendamento,

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

            FROM FAV_LISTA_ESPERA le
            LEFT JOIN ITEM_AGENDAMENTO i ON le.cd_it_agend = i.cd_item_agendamento
            WHERE le.dt_lanca_lista >= :startDate 
              AND le.dt_lanca_lista <= :endDate
              AND le.tp_situacao <> 'C'
            AND ROWNUM <= 5000 
        `, { startDate, endDate });

        if (result.rows) {
            solicitacoesRows = result.rows;
        }
        console.log(`> Encontradas ${solicitacoesRows.length} Solicitações.`);
    }

    // Enviar Dados (Sequencialmente por Tipo)
    // if (pacientesRows.length > 0) await sendInChunks(pacientesRows, 'PACIENTES'); // Removido: Tratado no stream
    if (itemsRows.length > 0) await sendInChunks(itemsRows, 'ITEMS');
    // if (agendaRows.length > 0) await sendInChunks(agendaRows, 'AGENDA'); // Removido: Tratado no stream
    if (solicitacoesRows.length > 0) await sendInChunks(solicitacoesRows, 'SOLICITACOES');

    if (!pacientesRows.length && !itemsRows.length && !agendaRows.length && !solicitacoesRows.length) {
        console.log(`[PULAR] Sem dados para o ano ${year}.`);
    }
}

async function runBackfill() {
    let connection;
    try {
        // ativando o modo do Thick para suporte do Oracle 11g 
        try {
            oracledb.initOracleClient();
        } catch (err) {
            console.warn('Aviso: Não foi possível ativar o modo Thick. Se estiver usando Oracle 11g, isso pode falhar.', err);
        }

        console.log('Conectando ao Oracle...');
        // @ts-ignore
        connection = await oracledb.getConnection({
            user: ORACLE_USER,
            password: ORACLE_PASSWORD,
            connectString: ORACLE_CONNECTION_STRING,
        });

        // 0. Autenticação (Executa uma vez antes do loop)
        await syncAuth(connection);

        // Executar loop por anos
        for (let year = START_YEAR; year <= END_YEAR; year++) {
            await syncYear(connection, year);
        }

        console.log('\n=== Backfill Completo ===');

    } catch (err: any) {
        console.error('Erro fatal no Backfill:', err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (e) {
                console.error(e);
            }
        }
    }
}

runBackfill();
