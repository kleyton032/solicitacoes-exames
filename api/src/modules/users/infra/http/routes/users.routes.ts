import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import { ensureAuthenticated } from "../../../../../shared/infra/http/middlewares/ensureAuthenticated";
import { ensureAdmin } from "../../../../../shared/infra/http/middlewares/ensureAdmin";

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post("/", ensureAuthenticated, ensureAdmin, usersController.create);

export { usersRoutes };
