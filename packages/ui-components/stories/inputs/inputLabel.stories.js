/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { InputLabel } from '../../src/components';

export default {
  title: 'Inputs/InputLabel',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const SimpleLabel = () => (
  <Container>
    <InputLabel label="Simple input label" />
  </Container>
);

export const LabelWithTooltip = () => (
  <Container>
    <InputLabel label="Label with tooltip" tooltip="This is a tooltip" />
  </Container>
);
