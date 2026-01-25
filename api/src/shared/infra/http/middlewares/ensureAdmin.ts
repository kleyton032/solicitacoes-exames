import { Request, Response, NextFunction } from "express";

export function ensureAdmin(
    request: Request,
    response: Response,
    next: NextFunction
): void {
    const { roles } = request.user;

    if (!roles || !roles.includes("ADMIN")) {
        throw new Error("User does not have permission for this action");
    }

    return next();
}
