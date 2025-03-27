import React, { useState, useEffect } from 'react';
import throttle from 'lodash.throttle';

import { Option } from '@tupaia/types';

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

  return (
    <Autocomplete<T, Multiple, DisableClearable, FreeSolo>
      {...props}
      onInputChange={throttle((_event, newValue) => {
        setQuery(newValue);
      }, 200)}
      options={options}
      loading={loading}
    />
  );
};
