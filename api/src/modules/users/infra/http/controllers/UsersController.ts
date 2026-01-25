import { Request, Response } from "express";
import { CreateUserService } from "../../../services/CreateUserService";
import { OracleUsersRepository } from "../../../repositories/oracle/OracleUsersRepository";

export class UsersController {
    public async create(request: Request, response: Response): Promise<Response> {
        const { legacy_user_id, name, email, password, roles } = request.body;

        const usersRepository = new OracleUsersRepository();
        const createUser = new CreateUserService(usersRepository);

        const user = await createUser.execute({
            legacy_user_id,
            name,
            email,
            password,
            roles
        });

        // @ts-ignore
        delete user.password_hash;

        return response.json(user);
    }
}
