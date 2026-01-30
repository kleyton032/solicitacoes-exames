import { PostgresSolicitacoesRepository } from '../repositories/postgres/PostgresSolicitacoesRepository';

class ListSolicitacoesService {
    private solicitacoesRepository: PostgresSolicitacoesRepository;

    constructor() {
        this.solicitacoesRepository = new PostgresSolicitacoesRepository();
    }

    async execute(cd_paciente?: number) {
        const solicitacoes = await this.solicitacoesRepository.findAll(cd_paciente);
        return solicitacoes;
    }
}

export { ListSolicitacoesService };
