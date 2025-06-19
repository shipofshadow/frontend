import { jwtDecode } from "jwt-decode";
interface JWTPayload {
    exp: number;
    [key: string]: any;
}

export function isTokenExpiredSoon(token: string, withinSeconds: number = 60): boolean {
    try {
        const payload = jwtDecode<JWTPayload>(token);
        const now = Math.floor(Date.now() / 1000);
        return payload.exp - now <= withinSeconds;
    } catch {
        return true;
    }
}
