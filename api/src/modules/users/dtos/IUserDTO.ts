export interface IUserDTO {
    id: number;
    legacy_user_id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    roles?: string[];
}
