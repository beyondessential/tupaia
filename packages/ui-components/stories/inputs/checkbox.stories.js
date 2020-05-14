/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Checkbox } from '../../src';

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

export const controlledCheckboxField = () => {
  const [checked, setChecked] = React.useState(true);

  const handleChange = event => {
    setChecked(event.target.checked);
  };

  return (
    <Container>
      <Checkbox checked={checked} onChange={handleChange} />
      <Checkbox checked={checked} onChange={handleChange} />
      <Checkbox checked={checked} onChange={handleChange} color="primary" />
      <Checkbox checked={checked} onChange={handleChange} color="primary" />
    </Container>
  );
};
