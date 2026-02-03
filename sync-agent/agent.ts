import oracledb from 'oracledb';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
const SYNC_INTERVAL_MS = 60 * 1000; // 60 segundos
const STATE_FILE = path.resolve(__dirname, 'sync_state.json');

interface SyncState {
    lastSyncTime: string | null;
}

function loadState(): SyncState {
    if (fs.existsSync(STATE_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        } catch (e) {
            console.error('Error reading state file, starting fresh.');
        }
    }
    return { lastSyncTime: null };
}

function saveState(state: SyncState) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function sendLog(status: 'SUCCESS' | 'ERROR' | 'INFO', message: string, summary?: string) {
    try {
        await axios.post(LOG_URL, {
            status,
            message,
            payload_summary: summary
        }, {
            headers: { 'x-sync-key': API_KEY }
        });
    } catch (err: any) {
        console.error('Failed to send log to API:', err.message);
    }
}

async function fetchAndSync() {
    let connection;

    try {
        console.log('--- Iniciando Execução de Sincronização ---');

        connection = await oracledb.getConnection({
            user: ORACLE_USER,
            password: ORACLE_PASSWORD,
            connectString: ORACLE_CONNECTION_STRING,
        });

        // --- 1. USUÁRIOS & ROLES ---
        const state = loadState();
        const lastSync = state.lastSyncTime ? new Date(state.lastSyncTime) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        console.log(`Buscando alterações desde: ${lastSync.toISOString()}`);

        // --- 1. USUÁRIOS & ROLES ---
        const roles = await connection.execute('SELECT ID, NAME, DESCRIPTION FROM AUTH_ROLES');
        const users = await connection.execute('SELECT ID, LEGACY_USER_ID, NAME, EMAIL, PASSWORD_HASH, CREATED_AT FROM AUTH_CREDENTIALS');
        const userRoles = await connection.execute('SELECT USER_ID, ROLE_ID FROM AUTH_USER_ROLES');

        // --- 2. PACIENTES ---
        const pacientes = await connection.execute(`
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
            WHERE dt_ultima_atualizacao >= :lastSync OR dt_cadastro >= :lastSync
        `, { lastSync });

        // --- 3. ITEM AGENDAMENTO ---
        const items = await connection.execute(`
            SELECT 
                cd_item_agendamento, ds_item_agendamento, tp_item, cd_exa_lab, cd_exa_rx, cd_pro_fat, cd_ssm,
                hr_realizacao, sn_ativo, sn_checa_guia, ds_mnemonico, cd_procedimento_sia, sn_sugere_alt_tempo_anestesia
            FROM ITEM_AGENDAMENTO
        `);

        // --- 4. IT AGENDA CENTRAL ---
        const agendaCentral = await connection.execute(`
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
            FROM IT_AGENDA_CENTRAL WHERE ROWNUM <= 100
        `);

        // --- 5. SOLICITACOES (FAV_LISTA_ESPERA) ---
        const solicitacoes = await connection.execute(`
            SELECT
                le.cd_lista_espera, le.cd_paciente, le.cd_it_agend, le.cd_atendimento, le.cd_procedimento, le.dt_atendimento,
                le.cd_prestador, le.cd_ori_ate, le.cd_convenio, le.cd_multi_empresa, le.olho, le.tp_situacao, le.observ,
                le.dt_agendamento, le.dt_marcacao, le.cd_it_agenda_central, le.nm_usuario_marc, le.dt_realizacao, le.dt_lanca_lista,
                le.cd_atendimento_r, le.sn_encaixe, le.cd_documento, le.cd_priori, le.ds_priori, le.cd_usuario_edit,
                le.cd_perg_od, le.cd_perg_oe, le.cd_id_fila, le.dt_retorno, le.sn_cota, le.resposta_retorno, le.cer_periodic,
                le.cer_tp_grup, le.cer_qt_grup, le.cer_tot_ses, le.cer_sessao
            FROM FAV_LISTA_ESPERA le
            FROM FAV_LISTA_ESPERA le
            WHERE le.dt_lanca_lista >= :lastSync
            AND le.tp_situacao <> 'C'
        `, { lastSync });

        const payload = {
            roles: roles.rows,
            users: users.rows,
            userRoles: userRoles.rows,
            pacientes: pacientes.rows,
            items: items.rows,
            agendaCentral: agendaCentral.rows,
            solicitacoes: solicitacoes.rows
        };

        const summary = `Buscados: Roles = ${payload.roles?.length}, Users = ${payload.users?.length}, Pacientes = ${payload.pacientes?.length}, Solicitacoes = ${payload.solicitacoes?.length} `;
        console.log(summary);

        // Push to API
        await axios.post(API_URL, payload, {
            headers: {
                'x-sync-key': API_KEY,
                'Content-Type': 'application/json'
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        console.log('Dados sincronizados com sucesso!');
        await sendLog('SUCCESS', 'Dados sincronizados com sucesso', summary);

        // Save new state
        saveState({ lastSyncTime: new Date().toISOString() });

    } catch (err: any) {
        console.error('Erro durante a sincronização:', err.message);
        await sendLog('ERROR', `Erro durante a sincronização: ${err.message} `);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }

        console.log(`Agendando próxima execução em ${SYNC_INTERVAL_MS / 1000} segundos...`);
        setTimeout(fetchAndSync, SYNC_INTERVAL_MS);
    }
}

// Inicia o loop
fetchAndSync();
