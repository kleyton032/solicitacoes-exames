import { hash } from "bcryptjs";
import { IUsersRepository } from "../repositories/IUsersRepository";
import { IUserDTO } from "../dtos/IUserDTO";

interface IRequest {
    legacy_user_id: string;
    name: string;
    email: string;
    password: string;
    roles?: string[];
}

export class CreateUserService {
    constructor(private usersRepository: IUsersRepository) { }

    public async execute({ legacy_user_id, name, email, password, roles }: IRequest): Promise<IUserDTO> {
        const userExists = await this.usersRepository.findByEmail(email);

        if (userExists) {
            throw new Error("User already exists");
        }

        const password_hash = await hash(password, 8);

        const user = await this.usersRepository.create({
            legacy_user_id,
            name,
            email,
            password_hash,
            roles
        });

        return user;
    }
}
