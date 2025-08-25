import { AccessPolicy } from '@tupaia/access-policy';
import { DatatrakWebModelRegistry } from '../../types';
import { useDatabase } from './useDatabase';
import { useCurrentUserContext } from '../../api';
import { useState } from 'react';

export type MutationOptions<TData, TVariables, TContext = unknown> = {
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: TData, variables: TVariables, context?: TContext) => void;
  onError?: (error: Error, variables: TVariables, context?: TContext) => void;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables,
    context?: TContext,
  ) => void;
};

export type MutationResult<TData, TVariables> = {
  data: TData | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
};

export const useDatabaseMutation = <TData, TVariables = void, TContext = unknown>(
  mutationFn: (
    models: DatatrakWebModelRegistry,
    variables: TVariables,
    accessPolicy?: AccessPolicy,
  ) => Promise<TData> | TData,
  options: MutationOptions<TData, TVariables, TContext> = {},
): MutationResult<TData, TVariables> => {
  const { models } = useDatabase();
  const { accessPolicy } = useCurrentUserContext();
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isIdle, setIsIdle] = useState(true);

  const reset = () => {
    setData(undefined);
    setError(undefined);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
    setIsIdle(true);
  };

  const mutateAsync = async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setIsIdle(false);
    setError(undefined);
    setIsSuccess(false);
    setIsError(false);

    let context: TContext | undefined;

    try {
      // Call onMutate callback
      if (options.onMutate) {
        context = await options.onMutate(variables);
      }

      // Execute the mutation
      const result = await mutationFn(models, variables, accessPolicy);

      setData(result);
      setIsSuccess(true);
      setIsLoading(false);

      // Call onSuccess callback
      if (options.onSuccess) {
        options.onSuccess(result, variables, context);
      }

      // Call onSettled callback
      if (options.onSettled) {
        options.onSettled(result, null, variables, context);
      }

      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsError(true);
      setIsLoading(false);

      // Call onError callback
      if (options.onError) {
        options.onError(error, variables, context);
      }

      // Call onSettled callback
      if (options.onSettled) {
        options.onSettled(undefined, error, variables, context);
      }

      throw error;
    }
  };

  const mutate = (variables: TVariables) => {
    mutateAsync(variables).catch(() => {
      // Error is already handled in mutateAsync, just prevent unhandled promise rejection
    });
  };

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    isIdle,
    mutate,
    mutateAsync,
    reset,
  };
};
