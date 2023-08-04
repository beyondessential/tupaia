/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { RadioGroup } from '../../src/components';

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

export const SimpleExample = () => {
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

export const LegendTooltip = () => {
  const [value, setValue] = useState('female');

  return (
    <Container>
      <RadioGroup
        label="Gender"
        name="gender"
        tooltip="Please select an option"
        options={options}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </Container>
  );
};

export const BooleanField = () => {
  const [value, setValue] = useState(true);

  const handleChange = useCallback(
    event => {
      let val = event.target.value;

      if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      }
      setValue(val);
    },
    [setValue],
  );

  return (
    <Container>
      <RadioGroup
        label="Save my details for next time"
        name="save"
        options={[
          {
            label: 'Yes',
            value: true,
            tooltip: 'This is a tooltip',
          },
          {
            label: 'No',
            value: false,
          },
        ]}
        value={value}
        onChange={handleChange}
      />
    </Container>
  );
};
