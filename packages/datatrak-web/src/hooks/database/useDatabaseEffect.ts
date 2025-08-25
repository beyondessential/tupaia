import { useEffect, useState } from 'react';

import { AccessPolicy } from '@tupaia/access-policy';

import { DatatrakWebModelRegistry } from '../../types';
import { useDatabaseContext } from './useDatabaseContext';
import { useCurrentUserContext } from '../../api';

export type ResultObject<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  onFetch: () => void;
};

export type DatabaseEffectOptions = {
  enabled: boolean;
  placeholderData?: unknown;
};

export const useCancelableEffect = <T>(
  fetcher: () => Promise<T> | T,
  dependencies: React.DependencyList = [],
  options: DatabaseEffectOptions = { enabled: true, placeholderData: undefined },
): ResultObject<T> => {
  const [data, setData] = useState<T | undefined>(options.placeholderData as T);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onFetch = async (isCancel?: () => boolean) => {
    if (!options.enabled) {
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
  call: (models: DatatrakWebModelRegistry, accessPolicy?: AccessPolicy) => Promise<T> | T,
  dependencies: React.DependencyList = [],
  options: DatabaseEffectOptions = { enabled: true },
): ResultObject<T> => {
  const { models } = useDatabaseContext();
  const { accessPolicy } = useCurrentUserContext();

  return useCancelableEffect(() => call(models, accessPolicy), dependencies, options);
};
