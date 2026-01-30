import { IPacientesRepository, ISearchPacienteFilter } from '../repositories/IPacientesRepository';
import { PostgresPacientesRepository } from '../repositories/postgres/PostgresPacientesRepository';

class SearchPacienteService {
    private pacientesRepository: IPacientesRepository;

    constructor() {
        this.pacientesRepository = new PostgresPacientesRepository();
    }

    async execute(filter: ISearchPacienteFilter) {
        const pacientes = await this.pacientesRepository.findByFilter(filter);
        return pacientes;
    }
}

export { SearchPacienteService };
