export async function hasApplied(token: string | null): Promise<boolean> {
    const response = await fetch('/api/applications/status', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Failed to check application status');

    const data = await response.json();
    return !!data.has_applied;
}
