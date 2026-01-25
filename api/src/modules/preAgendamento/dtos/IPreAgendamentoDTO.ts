export interface IPreAgendamentoDTO {
    cd_paciente: number;
    nm_paciente: string;
    cd_pre_internacao: number;
    nr_cpf: string;
    status: string; // A- CONFIRMADA S-SOLICITADO N-CANCELADO
    nm_cidade: string;
    //[key: string]: any; // Para os campos extras de pi.*
}
