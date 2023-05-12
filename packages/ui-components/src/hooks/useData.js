/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useCallback, useState } from 'react';

export const useData = fetcher => {
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (...args) => {
      setError(null);
      setIsLoading(true);

      try {
        const results = await fetcher(...args);
        setData(results);
      } catch (e) {
        setError(e);
      }

      setIsLoading(false);
    },
    [fetcher],
  );

  const clearData = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, clearData, fetchData };
};
