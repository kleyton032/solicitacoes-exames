import { IUserDTO } from '../dtos/IUserDTO';

export interface ICreateUserDTO {
    legacy_user_id: string;
    name: string;
    email: string;
    password_hash: string;
    roles?: string[];
}

export interface IUsersRepository {
    create(data: ICreateUserDTO): Promise<IUserDTO>;
    findByEmail(email: string): Promise<IUserDTO | undefined>;
    findById(id: number): Promise<IUserDTO | undefined>;
}
