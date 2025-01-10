import React, { useState, useEffect } from 'react';
import throttle from 'lodash.throttle';
import { Autocomplete, BaseAutocompleteProps } from './Autocomplete';

type FetchOptions = (query: string) => Promise<any[]>;

/**
 * Custom hook to fetch autocomplete options given a callback function
 */

const useOptions = (fetchOptions: FetchOptions, query: string): [any[], boolean] => {
  const [options, setOptions] = useState<any[]>([]);
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
interface AsyncAutocompleteProps extends BaseAutocompleteProps {
  fetchOptions: FetchOptions;
}

export const AsyncAutocomplete = ({
  fetchOptions,
  id,
  label = '',
  value,
  onChange,
  getOptionSelected,
  getOptionLabel,
  placeholder = '',
  error = false,
  disabled = false,
  required = false,
  helperText,
  muiProps,
}: AsyncAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [options, loading] = useOptions(fetchOptions, query);

  return (
    <Autocomplete
      id={id}
      options={options}
      label={label}
      getOptionSelected={getOptionSelected}
      getOptionLabel={getOptionLabel}
      value={value}
      disabled={disabled}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      required={required}
      helperText={helperText}
      loading={loading}
      onInputChange={throttle((event, newValue) => {
        setQuery(newValue);
      }, 200)}
      muiProps={muiProps}
    />
  );
};
