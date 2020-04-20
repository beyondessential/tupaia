/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect, useCallback } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';
import { TextField } from './TextField';
import { Autocomplete } from './Autocomplete';

/**
 * Custom hook to fetch autocomplete options given a callback function
 */
const useOptions = fetchOptions => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const data = await fetchOptions();
      const indexedOptions = data.map((option, index) => ({ ...option, index }));

      if (active) {
        setOptions(indexedOptions);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return options;
};

/**
 * Async Autocomplete. Gets options from a resource
 */
export const AsyncAutocomplete = ({ fetchOptions, ...props }) => {
  const options = useOptions(fetchOptions);
  const [open, setOpen] = useState(false);
  const loading = open && options.length === 0;

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <Autocomplete
      options={options}
      open={open}
      loading={loading}
      onOpen={handleOpen}
      onClose={handleClose}
      renderInput={params => (
        <TextField
          {...params}
          label={props.label}
          placeholder={props.placeholder}
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
      {...props}
    />
  );
};

AsyncAutocomplete.propTypes = {
  fetchOptions: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

AsyncAutocomplete.defaultProps = {
  placeholder: '',
};
