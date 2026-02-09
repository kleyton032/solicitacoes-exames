import { Request, Response } from "express";
import { CreateUserService } from "../../../services/CreateUserService";
import { PostgresUsersRepository } from "../../../repositories/postgres/PostgresUsersRepository"; // Switched to Postgres

export class UsersController {
    public async create(request: Request, response: Response): Promise<Response> {
        const { legacy_user_id, name, email, password, roles } = request.body;

        const usersRepository = new PostgresUsersRepository();
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

    public async index(request: Request, response: Response): Promise<Response> {
        const usersRepository = new PostgresUsersRepository();
        const users = await usersRepository.findAll();
        return response.json(users);
    }

    public async findAllRoles(request: Request, response: Response): Promise<Response> {
        const usersRepository = new PostgresUsersRepository();
        const roles = await usersRepository.findAllRoles();
        return response.json(roles);
    }

    public async updateRoles(request: Request, response: Response): Promise<Response> {
        const { id } = request.params;
        const { roles } = request.body;

        const usersRepository = new PostgresUsersRepository();
        await usersRepository.updateRoles(Number(id), roles);

        return response.status(204).send();
    }
}
