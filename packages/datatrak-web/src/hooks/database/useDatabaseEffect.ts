import { useEffect, useState } from 'react';

import { DatatrakWebModelRegistry } from '../../types';
import { useDatabase } from './useDatabase';

export type ResultArray<T> = [T | null, Error | null, boolean, () => void];

export const useCancelableEffect = <T>(
  fetcher: () => Promise<T> | T,
  dependencies = [],
): ResultArray<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const onFetch = async (isCancel?: () => boolean) => {
    setIsLoading(true);
    try {
      const result = await fetcher();
      if (!isCancel || !isCancel()) {
        setData(result);
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

  return [data, error, isLoading, onFetch];
};

export const useDatabaseEffect = <T>(
  call: (models: DatatrakWebModelRegistry) => Promise<T> | T,
  dependencies = [],
): ResultArray<T> => {
  const { models } = useDatabase();

  return useCancelableEffect(() => call(models), dependencies);
};
