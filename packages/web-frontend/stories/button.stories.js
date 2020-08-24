/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { PrimaryButton } from '../src/components/Buttons';
import { SubmitButton } from '../src/containers/Form/common/SubmitButton';

const Container = styled(MuiBox)`
  padding: 1rem;
`;

export default {
  title: 'Button',
  component: PrimaryButton,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

export const Primary = () => <PrimaryButton>Button</PrimaryButton>;

export const Submit = () => <SubmitButton text="Sign in" />;
