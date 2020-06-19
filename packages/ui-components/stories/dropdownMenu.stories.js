/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { DropdownMenu } from '../src/components/DropdownMenu';
import * as COLORS from './story-utils/theme/colors';

export default {
  title: 'DropdownMenu',
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 3rem 3rem 10rem 3rem;
`;

const options = ['Alert', 'Outbreak', 'Archive Alert '];

export const dropdownMenu = () => (
  <Container bgcolor={COLORS.BLUE}>
    <DropdownMenu options={options} />
  </Container>
);

