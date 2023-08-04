/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Tooltip } from '../src/components';

export default {
  title: 'Tooltip',
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 5rem;
`;

export const tooltip = () => (
  <Container>
    <Tooltip title="Tafuna Health Clinic ILI +55%" open>
      <Button>Tooltip button</Button>
    </Tooltip>
  </Container>
);

const tooltipHTML = (
  <>
    <Typography variant="body2">
      Click{' '}
      <MuiLink href="http://www.google.com" color="inherit">
        here
      </MuiLink>{' '}
      to find out more
    </Typography>
  </>
);

export const htmlTooltip = () => (
  <Container>
    <Tooltip title={tooltipHTML} interactive open>
      <Button>Tooltip button</Button>
    </Tooltip>
  </Container>
);
