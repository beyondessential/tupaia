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

function sleep(delay = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

/*
 * Mock api service layer. For demo purposes.
 */
const api = () => {
  const fetchData = async () => {
    const response = await fetch('https://country.register.gov.uk/records.json?page-size=5000');
    await sleep(500); // For demo purposes.
    const data = await response.json();
    return Object.keys(data).map(key => data[key].item[0]);
  };

  return {
    get: fetchData,
  };
};

/**
 * Async Autocomplete
 */
export const asyncAutoComplete = () => {
  const [value, setValue] = useState(null);

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  return (
    <Container>
      <AsyncAutocomplete
        label="Async Auto Complete"
        fetchOptions={api().get}
        onChange={handleChange}
        placeholder="Search..."
      />
      <Typography>Selected Value: {value ? value.name : 'none'}</Typography>
    </Container>
  );
};