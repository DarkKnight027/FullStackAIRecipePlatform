"use client";
import { useState, useCallback } from "react"; // Added useCallback
import { toast } from "sonner";

const useFetch = (fetchAction) => {
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // useCallback prevents the function from being recreated every render
    const fn = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAction(...args);
            setData(response);
        } catch (err) {
            setError(err);
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [fetchAction]); // only recreate if fetchAction changes

    return { data, loading, error, fn, setData };
}

export default useFetch;