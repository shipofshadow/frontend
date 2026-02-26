import { API_BASE_URL } from '../config';

export const getScholarshipSummary = (token: string) =>
    fetch(`${API_BASE_URL}/api/scholarship-summary/`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });

export const getRecommendations = (applicationId: number, token: string) =>
    fetch(`${API_BASE_URL}/api/evaluations/${applicationId}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });

export const getStudentSelection = (applicationId: number, token: string) =>
    fetch(`${API_BASE_URL}/api/evaluations/${applicationId}/student-selection`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });

export const submitStudentSelection = (applicationId: number, scholarshipId: number, token: string) =>
    fetch(`${API_BASE_URL}/api/evaluations/${applicationId}/student-select`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scholarship_id: scholarshipId }),
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });

export const updateStudentSelection = (applicationId: number, scholarshipId: number, token: string) =>
    fetch(`${API_BASE_URL}/api/evaluations/${applicationId}/student-select`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scholarship_id: scholarshipId }),
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });

export const adminApproveSelection = (
    applicationId: number,
    action: 'accept' | 'reject',
    reason: string | undefined,
    token: string,
) =>
    fetch(`${API_BASE_URL}/api/evaluations/${applicationId}/admin-approve-selection`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });

export const getPendingSelectionApprovals = (token: string) =>
    fetch(`${API_BASE_URL}/api/evaluations/`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });
