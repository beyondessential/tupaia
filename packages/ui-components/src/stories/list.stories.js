/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { List } from '../components/List';
import * as COLORS from '../theme/colors';
import Card from '@material-ui/core/Card';
import styled from 'styled-components';

export default {
  title: 'List',
  component: List,
};

const Container = styled.div`
  max-width: 360px;
  margin: 1rem;
`;

export const SimpleList = () => (
  <Container>
    <Card variant="outlined">
      <List />
    </Card>
  </Container>
);
