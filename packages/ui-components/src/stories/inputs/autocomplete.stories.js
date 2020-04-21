/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Autocomplete } from '../../components/Inputs';

export default {
  title: 'Inputs/Autocomplete',
};

const Container = styled.div`
  max-width: 400px;
  padding: 2rem;
`;

const options = [
  { id: 1, name: 'Sentinel Site One' },
  { id: 2, name: 'Sentinel Site Two' },
  { id: 3, name: 'Sentinel Site Three' },
  { id: 4, name: 'Sentinel Site Four' },
  { id: 5, name: 'Sentinel Site Five' },
  { id: 6, name: 'Sentinel Site Six' },
  { id: 7, name: 'Sentinel Site Seven' },
  { id: 8, name: 'Sentinel Site Eight' },
  { id: 9, name: 'Sentinel Site Nine' },
  { id: 10, name: 'Sentinel Site Ten' },
  { id: 11, name: 'Sentinel Site Eleven' },
  { id: 12, name: 'Sentinel Site Twelve' },
];

export const simple = () => (
  <Container>
    <Autocomplete label="Simple Auto Complete" options={options} placeholder="Search..." />
  </Container>
);

export const controlled = () => {
  const [value, setValue] = useState(null);

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  return (
    <Container>
      <Autocomplete
        label="Controlled Auto Complete"
        options={options}
        onChange={handleChange}
        value={value}
        placeholder="Search..."
      />
      <Typography>Selected Value: {value ? value.name : 'none'}</Typography>
    </Container>
  );
};
