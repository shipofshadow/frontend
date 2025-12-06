import type {Profile} from "../interfaces/profile.ts";

export type UserRole = 'bitress' | 'super_admin' | 'admin' | 'faculty' | 'student';

export default interface User {
    id: number;
    is_active: number;
    role: UserRole;
    username: string;
    profile?: Profile;
    email: string;
    campus_id?: number;
    campus_name?: string;
}
