declare namespace Express {
    export interface Request {
        user: {
            id: number;
            roles: string[];
            legacy_user_id: string;
        };
    }
}
