import { ISolicitacaoDTO } from '../dtos/ISolicitacaoDTO';

export interface ISolicitacoesRepository {
    findAll(): Promise<ISolicitacaoDTO[]>;
}
