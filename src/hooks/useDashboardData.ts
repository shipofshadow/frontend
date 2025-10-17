import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from "../config.ts";

interface FilterOptions {
    academicYear?: string;
    semester?: string;
    campus?: string;
    department?: string;
    course?: string;
    scholarship?: string;
    status?: string;
}

interface DashboardData {
    summary: any;
    scholarships: any;
    campuses: any;
    fuzzy: any;
    timeseries: any;
    demographics: any;
    bubbleData: any;
    statistics: any;
    filterOptions: any;
}

/**
 * Custom hook for fetching scholarship dashboard data
 * @param {FilterOptions} filters - Filter parameters for the dashboard
 * @returns {Object} Dashboard data and loading states
 */
export const useDashboardData = (filters: FilterOptions) => {
    const { token } = useAuth();
    const [data, setData] = useState<DashboardData>({
        summary: null,
        scholarships: null,
        campuses: null,
        fuzzy: null,
        timeseries: null,
        demographics: null,
        bubbleData: null,
        statistics: null,
        filterOptions: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Build query string from filters object
     */
    const buildQueryString = useCallback((filters: FilterOptions) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'All') {
                params.append(key, String(value));
            }
        });
        return params.toString();
    }, []);

    /**
     * Generic fetch function with error handling
     */
    const fetchData = useCallback(async (endpoint: string, filters: FilterOptions) => {
        try {
            const queryString = buildQueryString(filters);
            const url = `${API_BASE_URL}/api/reports/${endpoint}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            throw err;
        }
    }, [token, buildQueryString]);

    /**
     * Fetch all dashboard data
     */
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all endpoints in parallel
            const [
                summaryData,
                scholarshipsData,
                campusesData,
                fuzzyData,
                timeseriesData,
                demographicsData,
                bubbleData,
                statisticsData,
                filterOptionsData
            ] = await Promise.all([
                fetchData('dashboard/summary', filters),
                fetchData('dashboard/scholarships', filters),
                fetchData('dashboard/campuses', filters),
                fetchData('dashboard/fuzzy', filters),
                fetchData('dashboard/timeseries', filters),
                fetchData('dashboard/demographics', filters),
                fetchData('dashboard/income-gwa-bubble', filters),
                fetchData('dashboard/statistics', filters),
                fetchData('dashboard/filter-options', {}) // No filters for options
            ]);

            setData({
                summary: summaryData,
                scholarships: scholarshipsData,
                campuses: campusesData,
                fuzzy: fuzzyData,
                timeseries: timeseriesData,
                demographics: demographicsData,
                bubbleData: bubbleData,
                statistics: statisticsData,
                filterOptions: filterOptionsData
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, fetchData]);

    /**
     * Export dashboard data
     */
    const exportData = useCallback(async () => {
        try {
            const queryString = buildQueryString(filters);
            const url = `${API_BASE_URL}/api/reports/dashboard/export${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const exportData = await response.json();

            // Create and download CSV
            const csv = convertToCSV(exportData.data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url2 = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url2;
            a.download = `scholarship_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url2);

            return exportData;
        } catch (err) {
            console.error('Error exporting data:', err);
            throw err;
        }
    }, [filters, token, buildQueryString]);

    /**
     * Convert JSON to CSV
     */
    const convertToCSV = (data: any[]) => {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map((row: any) =>
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value;
                }).join(',')
            )
        ];

        return csvRows.join('\n');
    };

    // Fetch data when filters change
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return {
        data,
        loading,
        error,
        refetch: fetchAllData,
        exportData
    };
};

/**
 * Individual hook for specific dashboard section
 */
export const useDashboardSection = (section: string, filters: FilterOptions) => {
    const { token } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSectionData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'All') {
                    params.append(key, String(value));
                }
            });

            const queryString = params.toString();
            const url = `${API_BASE_URL}/api/reports/dashboard/${section}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error(`Error fetching ${section} data:`, err);
        } finally {
            setLoading(false);
        }
    }, [section, filters, token]);

    useEffect(() => {
        fetchSectionData();
    }, [fetchSectionData]);

    return { data, loading, error, refetch: fetchSectionData };
};

// Export default
export default useDashboardData;