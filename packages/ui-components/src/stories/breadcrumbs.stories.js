/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Breadcrumbs, LightBreadcrumbs } from '../components/Breadcrumbs';
import * as COLORS from '../theme/colors';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export default {
  title: 'Breadcrumbs',
  component: LightBreadcrumbs
};

export const breadcrumbs = () => (
  <Container>
    <Breadcrumbs />
  </Container>
);

export const lightBreadcrumbs = () => (
  <Container bgcolor={COLORS.BLUE}>
    <LightBreadcrumbs />
  </Container>
);