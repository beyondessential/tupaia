/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TextField } from './TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Autocomplete, StyledAutoComplete, NavInput, NavAutocomplete } from './Autocomplete';


function useOptions(fetchOptions) {
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
}


/*
 * Async Autocomplete
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
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      {...props}
    />
  );
};

/*
 * Async NavAutocomplete
 */
export const AsyncNavAutocomplete = ({ fetchOptions, ...props }) => {
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
    <NavAutocomplete
      options={options}
      open={open}
      loading={loading}
      onOpen={handleOpen}
      onClose={handleClose}
      {...props}
    />
  );
};
