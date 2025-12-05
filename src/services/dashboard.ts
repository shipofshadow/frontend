import {API_BASE_URL} from "../config.ts";

export async function activeApplicants(campusId?: number) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/active-applicants${params}`);
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

export async function approvedApplicants(campusId?: number) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/approved-applicants${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.approved_applicants;
    } catch (error) {
        console.error("Failed to fetch active applicants:", error);
        return null;
    }
}

export async function pendingApplicants(campusId?: number) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/pending-applicants${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.pending_applicants;
    } catch (error) {
        console.error("Failed to fetch active applicants:", error);
        return null;
    }
}

export async function rejectedApplicants(campusId?: number) {
    try {
        const params = campusId ? `?campus_id=${campusId}` : '';
        const response = await fetch(`${API_BASE_URL}/api/dashboard/rejected-applicants${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.rejected_applicants;
    } catch (error) {
        console.error("Failed to fetch active applicants:", error);
        return null;
    }
}