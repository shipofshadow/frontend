import {API_BASE_URL} from "../config.ts";

export async function activeApplicants() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/active-applicants`);
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

export async function approvedApplicants() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/approved-applicants`);
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

export async function pendingApplicants() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/pending-applicants`);
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

export async function rejectedApplicants() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/rejected-applicants`);
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