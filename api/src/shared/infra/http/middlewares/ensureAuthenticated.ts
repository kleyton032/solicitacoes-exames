import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import { redisClient } from "../../redis";

interface ITokenPayload {
    iat: number;
    exp: number;
    sub: string;
    roles: string[];
    legacy_user_id: string;
}

export async function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = request.headers.authorization;
    const cookieToken = request.cookies['Solicitacoes_Token'];

    if (!authHeader && !cookieToken) {
        throw new Error("JWT token is missing");
    }

    const token = cookieToken || authHeader?.split(" ")[1];

    if (!token) {
        throw new Error("Invalid JWT token format");
    }

    try {
        const decoded = verify(token, authConfig.jwt.secret);

        const { sub, roles, legacy_user_id } = decoded as ITokenPayload;


        const sessionExists = await redisClient.exists(`session:${token}`);

        if (!sessionExists) {
            throw new Error("Session expired or invalid");
        }

        request.user = {
            id: Number(sub),
            roles,
            legacy_user_id
        };

        return next();
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Invalid JWT token");
    }
}
