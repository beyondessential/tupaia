/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { AsyncAutocomplete } from '../../src';

export default {
  title: 'Inputs/AsyncAutocomplete',
};

const Container = styled.div`
  max-width: 400px;
  padding: 2rem;
`;

function sleep(delay = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

/*
 * Mock api service layer. For demo purposes.
 */
const api = () => {
  const fetchData = async query => {
    const response = await fetch(`https://swapi.dev/api/people/?search=${query}`);
    await sleep(500); // For demoing loading state
    const data = await response.json();
    return data.results;
  };

  return {
    get: fetchData,
  };
};

export const simple = () => {
  const fetchOptions = useCallback(api().get, []);
  return (
    <Container>
      <AsyncAutocomplete
        id="simple-autocomplete"
        label="Async Auto Complete"
        fetchOptions={fetchOptions}
        placeholder="Search..."
      />
    </Container>
  );
};

export const disabled = () => {
  const fetchOptions = useCallback(api().get, []);

  return (
    <Container>
      <AsyncAutocomplete
        label="Simple Auto Complete"
        fetchOptions={fetchOptions}
        placeholder="Search..."
        disabled
      />
    </Container>
  );
};

export const noLabel = () => {
  const fetchOptions = useCallback(api().get, []);

  return (
    <Container>
      <AsyncAutocomplete fetchOptions={fetchOptions} placeholder="Search..." />
    </Container>
  );
};

export const helperText = () => {
  const fetchOptions = useCallback(api().get, []);

  return (
    <Container>
      <AsyncAutocomplete
        label="Helper Text Example"
        fetchOptions={fetchOptions}
        placeholder="Search..."
        helperText="This field is required"
        required
      />
    </Container>
  );
};

export const error = () => {
  const fetchOptions = useCallback(api().get, []);

  return (
    <Container>
      <AsyncAutocomplete
        label="Simple Auto Complete"
        fetchOptions={fetchOptions}
        placeholder="Search..."
        helperText="Please try again!"
        error
      />
    </Container>
  );
};

export const controlled = () => {
  const [value, setValue] = useState(null);

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  const fetchOptions = useCallback(api().get, []);

  return (
    <Container>
      <AsyncAutocomplete
        label="Async Auto Complete"
        onChange={handleChange}
        value={value}
        fetchOptions={fetchOptions}
        placeholder="Search..."
      />
      <Typography>Selected Value: {value ? value.name : 'none'}</Typography>
    </Container>
  );
};

export const muiProps = () => {
  const fetchOptions = useCallback(api().get, []);

  return (
    <Container>
      <AsyncAutocomplete
        label="Mui Props Example"
        fetchOptions={fetchOptions}
        placeholder="Search..."
        helperText="Type free text or select an option"
        muiProps={{
          freeSolo: true,
        }}
      />
    </Container>
  );
};
