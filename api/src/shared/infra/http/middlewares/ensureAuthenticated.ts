import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import authConfig from "../../../../config/auth";

interface ITokenPayload {
    iat: number;
    exp: number;
    sub: string;
    roles: string[];
    legacy_user_id: string;
}

export function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction
): void {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        throw new Error("JWT token is missing");
    }

    const [, token] = authHeader.split(" ");

    try {
        const decoded = verify(token, authConfig.jwt.secret);

        const { sub, roles, legacy_user_id } = decoded as ITokenPayload;

        request.user = {
            id: Number(sub),
            roles,
            legacy_user_id
        };

        return next();
    } catch {
        throw new Error("Invalid JWT token");
    }
}
