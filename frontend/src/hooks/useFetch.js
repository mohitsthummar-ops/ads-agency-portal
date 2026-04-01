import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * Custom hook for standard fetch operations
 * @param {string} endpoint - API endpoint
 * @param {object} initialParams - Query params
 * @param {boolean} executeImmediately - Execute the fetch on mount
 * @returns {object} { data, loading, error, refetch, updateParams }
 */
export default function useFetch(endpoint, initialParams = {}, executeImmediately = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(executeImmediately);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(initialParams);

    const fetchData = useCallback(async (silent = false, overrideParams = null) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const currentParams = overrideParams || params;
            const res = await api.get(endpoint, { params: currentParams });
            setData(res.data);
            return res.data;
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Failed to fetch data';
            setError(errorMsg);
            if (!silent) toast.error(errorMsg);
            throw err;
        } finally {
            if (!silent) setLoading(false);
        }
    }, [endpoint, params]);

    // Update params and refetch
    const updateParams = (newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    };

    useEffect(() => {
        if (executeImmediately) {
            fetchData();
        }
    }, [fetchData, executeImmediately]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        updateParams,
        params
    };
}
