import { ISolicitacaoDTO } from '../dtos/ISolicitacaoDTO';

export interface ISolicitacoesRepository {
    findAll(cd_paciente?: number): Promise<ISolicitacaoDTO[]>;
}
