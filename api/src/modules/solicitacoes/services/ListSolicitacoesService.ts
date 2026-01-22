import { SolicitacoesRepository } from '../repositories/SolicitacoesRepository';

class ListSolicitacoesService {
    private solicitacoesRepository: SolicitacoesRepository;

    constructor() {
        this.solicitacoesRepository = new SolicitacoesRepository();
    }

    async execute() {
        const solicitacoes = await this.solicitacoesRepository.findAll();
        return solicitacoes;
    }
}

export { ListSolicitacoesService };
