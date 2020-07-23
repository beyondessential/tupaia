/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Select, NativeSelect } from '../../src';

export default {
  title: 'Inputs/Select',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

const options = [
  { label: 'Afghanistan', value: 'AF' },
  { label: 'Albania', value: 'AL' },
  { label: 'American Samoa', value: 'AS' },
  { label: 'Angola', value: 'AO' },
  { label: 'New Caledonia', value: 'NC' },
  { label: 'New Zealand', value: 'NZ' },
  { label: 'Nicaragua', value: 'NI' },
  { label: 'Nigeria', value: 'NG' },
];

export const select = () => (
  <Container>
    <Select label="Simple select" id="simple" options={options} />
    <Select label="Required select" id="required" options={options} required />
    <NativeSelect label="Native select" id="native" options={options} />
    <Select label="Default value" id="default-value" options={options} defaultValue="NZ" />
    <Select
      label="Custom placeholder"
      id="placeholder"
      placeholder="Custom text"
      options={options}
    />
    <Select
      label="Helper text"
      id="helper"
      options={options}
      helperText="Please select your country"
    />
  </Container>
);
