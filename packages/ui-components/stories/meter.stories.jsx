import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import MuiCard from '@material-ui/core/Card';
import MuiCardContent from '@material-ui/core/CardContent';
import { BarMeter, CircleMeter } from '../src/components';
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
        <CircleMeter value={0} />
        <CircleMeter value={0.34} />
        <CircleMeter value={50} total={100} />
        <CircleMeter value={6.9} total={8} />
        <CircleMeter value={1} />
        <CircleMeter value={20} total={10} />
      </MuiCardContent>
    </MuiCard>
  </Container>
);
