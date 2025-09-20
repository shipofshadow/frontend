import type {Profile} from "../interfaces/profile.ts";

export default interface User {
    id: number;
    is_active: number;
    role: string;
    username: string;
    profile?: Profile;
    email: string;
}
