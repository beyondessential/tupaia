/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Checkbox } from '../../src/components';

export default {
  title: 'Inputs/Checkbox',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const checkboxField = () => (
  <Container>
    <Checkbox />
    <Checkbox defaultChecked />
    <Checkbox color="primary" />
    <Checkbox defaultChecked color="primary" />
  </Container>
);

export const labels = () => (
  <Container>
    <Checkbox label="Remember me" color="primary" />
    <Checkbox label="Terms and Conditions" color="primary" defaultChecked />
    <Checkbox
      label="Terms and Conditions"
      color="primary"
      helperText="Please read the terms and conditions carefully"
    />
    <Checkbox
      label="Terms and Conditions"
      color="primary"
      error
      helperText="Please tick Terms and Conditions"
    />
    <Checkbox
      label="Terms and Conditions"
      color="primary"
      tooltip="Please read the terms and conditions carefully"
    />
  </Container>
);

export const controlledCheckboxField = () => {
  const [checked, setChecked] = useState(true);

  const handleChange = useCallback(event => {
    setChecked(event.target.checked);
  }, []);

  return (
    <Container>
      <Checkbox label="Remember me" color="primary" checked={checked} onChange={handleChange} />
    </Container>
  );
};
