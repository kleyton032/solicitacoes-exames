import { Request, Response } from "express";
import { AuthenticateUserService } from "../../../services/AuthenticateUserService";
import { OracleUsersRepository } from "../../../repositories/oracle/OracleUsersRepository";

export class SessionsController {
    public async create(request: Request, response: Response): Promise<Response> {
        const { email, password } = request.body;

        const usersRepository = new OracleUsersRepository();
        const authenticateUser = new AuthenticateUserService(usersRepository);

        const { user, token } = await authenticateUser.execute({
            email,
            password
        });

        return response.json({ user, token });
    }
}
