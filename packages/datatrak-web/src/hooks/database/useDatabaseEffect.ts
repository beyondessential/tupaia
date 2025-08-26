import { useEffect, useState } from 'react';

import { AccessPolicy } from '@tupaia/access-policy';

import { DatatrakWebModelRegistry } from '../../types';
import { useDatabaseContext } from './useDatabaseContext';
import { CurrentUser, useCurrentUserContext } from '../../api';

export type ResultObject<T> = {
  data: T;
  error: Error | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  onFetch: () => void;
};

export type DatabaseEffectOptions = {
  enabled?: boolean;
  placeholderData?: unknown;
  onError?: (e: Error) => void;
};

export const useCancelableEffect = <T>(
  fetcher: () => Promise<T> | T,
  dependencies: React.DependencyList = [],
  options: DatabaseEffectOptions,
): ResultObject<T> => {
  const { enabled = true, placeholderData, onError } = options;
  const [data, setData] = useState<T>(placeholderData as T);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onFetch = async (isCancel?: () => boolean) => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetcher();
      if (!isCancel || !isCancel()) {
        setData(result);
        setIsSuccess(true);
      }
    } catch (e: any) {
      setError(e);
      onError?.(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let canceled = false;
    onFetch(() => canceled);
    return (): void => {
      canceled = true;
    };
  }, dependencies);

  return { data, error, isLoading, isSuccess, onFetch };
};

export const useDatabaseEffect = <T>(
  call: (
    models: DatatrakWebModelRegistry,
    accessPolicy?: AccessPolicy,
    user?: CurrentUser,
  ) => Promise<T> | T,
  dependencies: React.DependencyList = [],
  options: DatabaseEffectOptions = { enabled: true, onError: (_e: Error) => {} },
): ResultObject<T> => {
  const { models } = useDatabaseContext();
  const { accessPolicy, ...user } = useCurrentUserContext();

  return useCancelableEffect(() => call(models, accessPolicy, user), dependencies, options);
};
