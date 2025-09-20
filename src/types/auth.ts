// types/auth.ts
export interface PrefillProfile {
    email?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
}

export interface LinkData {
    existing_id: string;
    existing_email: string;
    existing_first_name: string;
    existing_last_name: string;
    provider: 'google' | 'facebook';
    provider_id: string;
    oauth_email: string;
    first_name: string;
    last_name: string;
    avatar: string;
}

export interface LinkAccountRequest {
    user_id: string;
    provider: string;
    provider_id: string;
    oauth_email: string;
    first_name: string;
    last_name: string;
    avatar: string;
}

export interface CreateNewAccountRequest {
    provider: string;
    provider_id: string;
    oauth_email: string;
    first_name: string;
    last_name: string;
    avatar: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    refresh_token?: string;
    user?: any;
    needs_profile?: boolean;
    error?: string;
    message?: string;
}