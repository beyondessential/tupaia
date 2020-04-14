/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Meter } from '../components/Meter';
import * as COLORS from '../theme/colors';
import MuiBox from '@material-ui/core/Box';
import { Card, CardContent, CardFooter } from '../components/Card';

export default {
  title: 'Meter',
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  .MuiCard-root {
    max-width: 360px;
  }
`;

export const meter = () => (
  <Container>
    <Card variant="outlined">
      <CardContent>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab alias aliquid, beatae
        consectetur consequuntur dolorum error explicabo ipsam iusto laborum modi obcaecati quae
        quia quo rem sed tempore unde vel.
      </CardContent>
      <CardFooter>
        <Meter value={22} total={30} />
      </CardFooter>
    </Card>
  </Container>
);
