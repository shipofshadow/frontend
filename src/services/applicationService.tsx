import {API_BASE_URL} from "../config.ts";

export async function hasApplied(token: string | null): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/application/status`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to check application status');

    const data = await response.json();
    return !!data.has_applied;
}
