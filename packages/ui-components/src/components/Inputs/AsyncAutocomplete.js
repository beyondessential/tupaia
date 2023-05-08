/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import throttle from 'lodash.throttle';
import PropTypes from 'prop-types';
import { Autocomplete } from './Autocomplete';

/**
 * Custom hook to fetch autocomplete options given a callback function
 */
const useOptions = (fetchOptions, query) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

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
export const AsyncAutocomplete = ({
  fetchOptions,
  id,
  label,
  value,
  onChange,
  getOptionSelected,
  getOptionLabel,
  placeholder,
  error,
  disabled,
  required,
  helperText,
  muiProps,
}) => {
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

AsyncAutocomplete.propTypes = {
  fetchOptions: PropTypes.func.isRequired,
  label: PropTypes.string,
  value: PropTypes.any,
  id: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  helperText: PropTypes.string,
  onChange: PropTypes.func,
  getOptionSelected: PropTypes.func,
  getOptionLabel: PropTypes.func,
  placeholder: PropTypes.string,
  muiProps: PropTypes.object,
};

AsyncAutocomplete.defaultProps = {
  label: '',
  getOptionSelected: undefined,
  getOptionLabel: undefined,
  placeholder: '',
  required: false,
  disabled: false,
  error: false,
  value: undefined,
  onChange: undefined,
  muiProps: undefined,
  id: undefined,
  helperText: undefined,
};
