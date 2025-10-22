// ============================================================================
// src/hooks/useFetch.js - Generic Data Fetching Hook
// ============================================================================

import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiClient.get(endpoint);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (endpoint) {
      fetchData();
    }
  }, [endpoint, options.refetch]);

  return { data, loading, error };
};
