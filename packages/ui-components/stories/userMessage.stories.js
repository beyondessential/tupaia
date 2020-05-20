/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { UserMessage } from '../src';

export default {
  title: 'UserMessage',
};

const Container = styled(MuiBox)`
  max-width: 460px;
  padding: 1rem;
`;

export const AllUserMessages = () => (
  <Container>
    <UserMessage />
  </Container>
);
