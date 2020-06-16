/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import { Main } from '../../components';
import { ArchiveTable } from '../../containers';

export const ArchiveTabView = () => (
  <MuiContainer>
    <Main>
      <ArchiveTable />
    </Main>
  </MuiContainer>
);
