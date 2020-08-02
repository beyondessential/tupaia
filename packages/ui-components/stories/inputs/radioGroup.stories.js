/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { RadioGroup } from '../../src';

export default {
  title: 'Inputs/RadioGroup',
};

const Container = styled.div`
  padding: 2rem;
`;

const options = [
  {
    label: 'Female',
    value: 'female',
  },
  {
    label: 'Male',
    value: 'male',
  },
  {
    label: 'Other',
    value: 'other',
  },
];

export const radioGroup = () => {
  const [value, setValue] = useState('female');

  return (
    <Container>
      <RadioGroup
        label="Gender"
        name="gender"
        options={options}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </Container>
  );
};

export const booleanField = () => {
  const [value, setValue] = useState(true);

  return (
    <Container>
      <RadioGroup
        label="Save my details for next time"
        name="save"
        options={[
          {
            label: 'Yes',
            value: true,
          },
          {
            label: 'No',
            value: false,
          },
        ]}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </Container>
  );
};
