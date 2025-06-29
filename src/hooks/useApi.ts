// Custom hooks for API operations
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

// Specific hooks for common operations
export function useSkills(params?: Parameters<typeof apiService.getSkills>[0]) {
  return useApi(() => apiService.getSkills(params));
}

export function useUserSkills(userId: string) {
  return useApi(() => apiService.getUserSkills(userId), {
    immediate: !!userId,
  });
}

export function useEmployees(params?: Parameters<typeof apiService.getEmployees>[0]) {
  return useApi(() => apiService.getEmployees(params));
}

export function useAssessments(params?: Parameters<typeof apiService.getAssessments>[0]) {
  return useApi(() => apiService.getAssessments(params));
}

// Mutation hooks for create/update/delete operations
export function useApiMutation<T, P>(
  apiCall: (params: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall(params);
      setState({ data, loading: false, error: null });
      options.onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      options.onError?.(errorMessage);
      throw error;
    }
  };

  return {
    ...state,
    mutate,
  };
}