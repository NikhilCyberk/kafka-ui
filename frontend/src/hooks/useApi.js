import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';

export const useApi = (apiCall, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const {
    autoFetch = true,
    showError = true,
    showSuccess = false,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
    onSuccess,
    onError,
    transformData,
  } = options;

  const execute = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(params);
      const transformedData = transformData ? transformData(response.data) : response.data;
      setData(transformedData);

      if (showSuccess) {
        enqueueSnackbar(successMessage, { variant: 'success' });
      }

      if (onSuccess) {
        onSuccess(transformedData);
      }

      return { success: true, data: transformedData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      setError(errorMsg);

      if (showError) {
        enqueueSnackbar(errorMsg, { variant: 'error' });
      }

      if (onError) {
        onError(err);
      }

      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [apiCall, showError, showSuccess, successMessage, errorMessage, onSuccess, onError, transformData, enqueueSnackbar]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute(),
  };
};

export const useApiWithParams = (apiCall, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(params);
      setData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [apiCall, params, enqueueSnackbar]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
}; 