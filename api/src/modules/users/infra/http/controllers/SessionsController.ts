import { Request, Response } from "express";
import { AuthenticateUserService } from "../../../services/AuthenticateUserService";
import { PostgresUsersRepository } from "../../../repositories/postgres/PostgresUsersRepository";
import { redisClient } from "../../../../../shared/infra/redis";

export class SessionsController {
    public async create(request: Request, response: Response): Promise<Response> {
        const { email, password } = request.body;

        const usersRepository = new PostgresUsersRepository();
        const authenticateUser = new AuthenticateUserService(usersRepository);

        const { user, token } = await authenticateUser.execute({
            email,
            password
        });


        response.cookie('Solicitacoes_Token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400000, // 1 dia em ms
            sameSite: 'lax'
        });

        return response.json({ user, token });
    }

    public async delete(request: Request, response: Response): Promise<Response> {
        const authHeader = request.headers.authorization;
        const cookieToken = request.cookies['Solicitacoes_Token'];
        const token = cookieToken || authHeader?.split(" ")[1];

        if (token) {
            await redisClient.del(`session:${token}`);
        }

        response.clearCookie('Solicitacoes_Token');

        return response.status(204).send();
    }
}
