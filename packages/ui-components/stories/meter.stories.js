/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import MuiCard from '@material-ui/core/Card';
import MuiCardContent from '@material-ui/core/CardContent';
import { BarMeter, CircleMeter } from '../src';
import * as COLORS from './story-utils/theme/colors';

export default {
  title: 'Meters',
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  .MuiCard-root {
    max-width: 360px;
  }
`;

export const barMeter = () => (
  <Container>
    <MuiCard variant="outlined">
      <MuiCardContent>
        <BarMeter value={22} total={30} />
      </MuiCardContent>
    </MuiCard>
  </Container>
);

export const circleMeter = () => (
  <Container>
    <MuiCard variant="outlined">
      <MuiCardContent>
        <CircleMeter percent={0} />
        <CircleMeter percent={34} />
        <CircleMeter percent={50} />
        <CircleMeter percent={99} />
        <CircleMeter percent={100} />
      </MuiCardContent>
    </MuiCard>
  </Container>
);
