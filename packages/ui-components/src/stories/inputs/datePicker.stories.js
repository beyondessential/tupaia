/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { DatePicker } from '../../components/Inputs';

export default {
  title: 'Inputs/DatePicker',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const datePicker = () => (
  <Container>
    <DatePicker label="Basic example" />
  </Container>
);
