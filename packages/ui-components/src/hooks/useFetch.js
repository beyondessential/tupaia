import { useCallback, useState } from 'react';

export const useFetch = fetcher => {
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isTriggered = data !== undefined || isLoading || error;

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

  return { data, isLoading, error, isTriggered, clearData, fetchData };
};
