/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { PrimaryButton } from '../src/components/Buttons';
import { SubmitButton } from '../src/containers/Form/common/SubmitButton';

export default {
  title: 'Button',
  component: PrimaryButton,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const Primary = () => (
  <Container>
    <PrimaryButton>Button</PrimaryButton>
  </Container>
);

export const Submit = () => (
  <Container>
    <SubmitButton text="Sign in" />
  </Container>
);
