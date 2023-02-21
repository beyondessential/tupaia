/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { GroupedSelect } from '../../src';

export default {
  title: 'Inputs/GroupedSelect',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

const groupedOptions = {
  'Northern hemisphere': [
    { label: 'Afghanistan', value: 'AF' },
    { label: 'Albania', value: 'AL' },
    { label: 'Nicaragua', value: 'NI' },
    { label: 'Nigeria', value: 'NG' },
  ],
  'Southern hemisphere': [
    { label: 'Angola', value: 'AO' },
    { label: 'American Samoa', value: 'AS' },
    { label: 'New Caledonia', value: 'NC' },
    { label: 'New Zealand', value: 'NZ' },
  ],
};

export const select = () => (
  <Container>
    <GroupedSelect label="Grouped select" id="hi" groupedOptions={groupedOptions} />
  </Container>
);

export const Controlled = () => {
  const [value, setValue] = useState('AF');

  return (
    <Container>
      <GroupedSelect
        label="Controlled Grouped select"
        id="controlled"
        groupedOptions={groupedOptions}
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      <div>Selected Value: {value}</div>
    </Container>
  );
};
