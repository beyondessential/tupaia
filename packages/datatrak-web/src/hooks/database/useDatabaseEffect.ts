import { useEffect, useState } from 'react';

import { DatatrakWebModelRegistry } from '../../types';
import { useDatabase } from './useDatabase';

export type ResultObject<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  onFetch: () => void;
};

export const useCancelableEffect = <T>(
  fetcher: () => Promise<T> | T,
  dependencies: unknown[] = [],
  options: { enabled: boolean } = { enabled: true },
): ResultObject<T> => {
  const [data, setData] = useState<T | undefined>(undefined);
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
  call: (models: DatatrakWebModelRegistry) => Promise<T> | T,
  dependencies: unknown[] = [],
  options: { enabled: boolean } = { enabled: true },
): ResultObject<T> => {
  const { models } = useDatabase();

  return useCancelableEffect(() => call(models), dependencies, options);
};
