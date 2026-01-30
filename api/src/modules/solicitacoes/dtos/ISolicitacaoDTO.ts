export interface ISolicitacaoDTO {
    cd_paciente: number;
    nr_cpf: string;
    nr_cns: string;
    cd_it_agend: number;
    tp_situacao: string;
    ds_item_agendamento: string;
    dt_lanca_lista: Date;
    item_agendamento_correlato?: Date;
    ds_item_agendamento_correlato?: string;
    cd_multi_empresa: number;
}
