import { throttle } from 'es-toolkit/compat';
import React, { useState, useEffect, useCallback } from 'react';

import { Autocomplete, BaseAutocompleteProps } from './Autocomplete';

type FetchOptions<T> = (query: string) => Promise<T[]>;

/**
 * Custom hook to fetch autocomplete options given a callback function
 */
const useAutocompleteOptions = <T,>(
  fetchOptions: FetchOptions<T>,
  query: string,
): [T[], boolean] => {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const data = await fetchOptions(query);

      if (active) {
        setOptions(data);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [fetchOptions, query]);

  return [options, loading];
};

/**
 * Async Autocomplete. Gets options from a resource
 */
interface AsyncAutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends BaseAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  fetchOptions: FetchOptions<T>;
}

export const AsyncAutocomplete = <
  T = unknown,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>(
  props: AsyncAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
) => {
  const [query, setQuery] = useState('');
  const [options, loading] = useAutocompleteOptions<T>(props.fetchOptions, query);

  const onInputChange = useCallback(
    throttle((_event: React.ChangeEvent<{}>, newValue: string) => {
      setQuery(newValue);
    }, 200),
    [],
  );

  return (
    <Autocomplete<T, Multiple, DisableClearable, FreeSolo>
      {...props}
      onInputChange={onInputChange}
      options={options}
      loading={loading}
    />
  );
};
