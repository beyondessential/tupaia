/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import { Main, OutbreaksTable } from '../components';

export const OutbreaksTabView = () => (
  <MuiContainer>
    <Main>
      <OutbreaksTable />
    </Main>
  </MuiContainer>
);
