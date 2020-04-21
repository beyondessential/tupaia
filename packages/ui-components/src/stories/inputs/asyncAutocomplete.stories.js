/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { AsyncAutocomplete } from '../../components/Inputs';

export default {
  title: 'Inputs/AsyncAutocomplete',
};

const Container = styled.div`
  max-width: 400px;
  padding: 2rem;
`;

/*
 * Mock api service layer. For demo purposes.
 */
const api = () => {
  const fetchData = async query => {
    const response = await fetch(`https://swapi.dev/api/people/?search=${query}`);
    const data = await response.json();
    return data.results;
  };

  return {
    get: fetchData,
  };
};

export const simple = () => {
  const fetchOptions = useCallback(api().get, [api().get]);
  return (
    <Container>
      <AsyncAutocomplete
        label="Async Auto Complete"
        fetchOptions={fetchOptions}
        placeholder="Search..."
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

  const fetchOptions = useCallback(api().get, [api().get]);

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
