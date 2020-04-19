/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Autocomplete, NavAutocomplete } from '../../components/Inputs';

export default {
  title: 'Inputs/Autocomplete',
};

const Container = styled.div`
  max-width: 400px;
  padding: 2rem;
`;

export const autoComplete = () => (
  <Container>
    <Autocomplete label="Simple Auto Complete" options={options} placeholder="Search..." />
  </Container>
);

export const navAutoComplete = () => (
  <Container>
    <NavAutocomplete label="Nav Auto Complete" options={options} placeholder="Search..." />
  </Container>
);

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
