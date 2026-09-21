import {API_BASE_URL} from "../config.ts";

function authHeaders(token?: string | null): HeadersInit {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function activeApplicants(campusId?: number, token?: string | null) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/active-applicants${params}`, {
            headers: authHeaders(token),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.active_applicants;
    } catch (error) {
        console.error("Failed to fetch active applicants:", error);
        return null;
    }
}

export async function approvedApplicants(campusId?: number, token?: string | null) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/approved-applicants${params}`, {
            headers: authHeaders(token),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.approved_applicants;
    } catch (error) {
        console.error("Failed to fetch approved applicants:", error);
        return null;
    }
}

export async function pendingApplicants(campusId?: number, token?: string | null) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/pending-applicants${params}`, {
            headers: authHeaders(token),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.pending_applicants;
    } catch (error) {
        console.error("Failed to fetch pending applicants:", error);
        return null;
    }
}

export async function rejectedApplicants(campusId?: number, token?: string | null) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/rejected-applicants${params}`, {
            headers: authHeaders(token),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.rejected_applicants;
    } catch (error) {
        console.error("Failed to fetch rejected applicants:", error);
        return null;
    }
}

export interface MetricsData {
    overall: {
        overall_total: number;
        approved_total: number;
        pending_total: number;
        denied_total: number;
        approval_rate_pct: number;
    } | null;
    per_semester: Array<{
        academic_year: string;
        semester: string;
        total: number;
        approved: number;
        pending: number;
        denied: number;
    }>;
    per_campus: Array<{
        campus: string | null;
        total: number;
        approved: number;
    }>;
    top_courses: Array<{
        course: string | null;
        department: string | null;
        campus: string | null;
        total: number;
    }>;
}

export async function getMetrics(token?: string | null): Promise<MetricsData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/metrics`, {
            headers: authHeaders(token),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch metrics:", error);
        return null;
    }
}