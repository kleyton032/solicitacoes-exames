import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import authConfig from "../../../config/auth";
import { IUsersRepository } from "../repositories/IUsersRepository";

interface IRequest {
    email: string;
    password: string;
}

interface IResponse {
    user: {
        id: number;
        name: string;
        email: string;
        roles?: string[];
    };
    token: string;
}

export class AuthenticateUserService {
    constructor(private usersRepository: IUsersRepository) { }

    public async execute({ email, password }: IRequest): Promise<IResponse> {
        const user = await this.usersRepository.findByEmail(email);

        if (!user) {
            throw new Error("Email or password incorrect");
        }

        const passwordMatched = await compare(password, user.password_hash);

        if (!passwordMatched) {
            throw new Error("Email or password incorrect");
        }

        const { secret, expiresIn } = authConfig.jwt;

        const token = sign(
            {
                roles: user.roles,
                legacy_user_id: user.legacy_user_id
            },
            secret as string,
            {
                subject: String(user.id),
                expiresIn: expiresIn as any,
            }
        );

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles
            },
            token,
        };
    }
}
