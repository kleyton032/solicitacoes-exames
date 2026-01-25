import { IPacientesRepository, ISearchPacienteFilter } from '../repositories/IPacientesRepository';
import { PacientesRepository } from '../repositories/PacientesRepository';

class SearchPacienteService {
    private pacientesRepository: IPacientesRepository;

    constructor() {
        this.pacientesRepository = new PacientesRepository();
    }

    async execute(filter: ISearchPacienteFilter) {
        const pacientes = await this.pacientesRepository.findByFilter(filter);
        return pacientes;
    }
}

export { SearchPacienteService };
