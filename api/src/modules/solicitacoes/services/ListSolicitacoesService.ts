import { SolicitacoesRepository } from '../repositories/SolicitacoesRepository';

class ListSolicitacoesService {
    private solicitacoesRepository: SolicitacoesRepository;

    constructor() {
        this.solicitacoesRepository = new SolicitacoesRepository();
    }

    async execute(cd_paciente?: number) {
        const solicitacoes = await this.solicitacoesRepository.findAll(cd_paciente);
        return solicitacoes;
    }
}

export { ListSolicitacoesService };
