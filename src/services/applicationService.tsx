import {API_BASE_URL} from "../config.ts";
import type {ApplicationStatus} from "../interfaces/application_status.ts";

export async function hasApplied(token: string | null): Promise<ApplicationStatus> {
    const response = await fetch(`${API_BASE_URL}/api/application/status`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to check application status');

    return await response.json();
}
