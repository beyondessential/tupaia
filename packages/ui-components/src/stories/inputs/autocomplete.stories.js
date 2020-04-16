/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Autocomplete, FancyAutocomplete } from '../../components/Inputs';

export default {
  title: 'Inputs/Autocomplete',
};

const Container = styled.div`
  max-width: 400px;
  padding: 2rem;
`;

export const autoComplete = () => (
  <Container>
    <Autocomplete label="Simple Auto Complete" options={options} />
  </Container>
);

export const asyncAutoComplete = () => (
  <Container>
    <Autocomplete label="Simple Auto Complete" options={options} />
  </Container>
);

export const fancyAutoComplete = () => (
  <Container>
    <FancyAutocomplete label="Fancy Auto Complete" options={options} />
  </Container>
);

const options = [
  { title: 'Sentinel Site One', code: 1 },
  { title: 'Sentinel Site Two', code: 2 },
  { title: 'Sentinel Site Three', code: 3 },
  { title: 'Sentinel Site Four', code: 4 },
  { title: 'Sentinel Site Five', code: 5 },
  { title: 'Sentinel Site Six', code: 6 },
  { title: 'Sentinel Site Seven', code: 7 },
  { title: 'Sentinel Site Eight', code: 8 },
  { title: 'Sentinel Site Nine', code: 9 },
  { title: 'Sentinel Site Ten', code: 10 },
  { title: 'Sentinel Site Eleven', code: 11 },
  { title: 'Sentinel Site Twelve', code: 12 },
];
