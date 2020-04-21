/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect, useCallback } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import throttle from 'lodash.throttle';
import PropTypes from 'prop-types';
import { TextField } from './TextField';
import { Autocomplete } from './Autocomplete';

/**
 * Custom hook to fetch autocomplete options given a callback function
 */
const useOptions = (callback, query) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const data = await callback(query);

      if (active) {
        setOptions(data);
      }
    })();

    return () => {
      active = false;
    };
  }, [callback, query]);

  return options;
};

/**
 * Async Autocomplete. Gets options from a resource
 */
export const AsyncAutocomplete = ({
  label,
  fetchOptions,
  value,
  onChange,
  labelKey,
  placeholder,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const options = useOptions(fetchOptions, query);
  const loading = open && options.length === 0;

  const handleInputChange = useCallback(
    throttle((event, newValue) => {
      setQuery(newValue);
    }, 200),
    [setQuery],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <Autocomplete
      options={options}
      label={label}
      labelKey={labelKey}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      open={open}
      loading={loading}
      onInputChange={handleInputChange}
      onOpen={handleOpen}
      onClose={handleClose}
      renderInput={params => (
        <TextField
          {...params}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

AsyncAutocomplete.propTypes = {
  fetchOptions: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  labelKey: PropTypes.string,
  placeholder: PropTypes.string,
};

AsyncAutocomplete.defaultProps = {
  value: undefined,
  onChange: undefined,
  placeholder: '',
  labelKey: 'name',
};
