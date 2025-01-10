import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import { Main } from '../../components';
import { ArchiveTable } from '../../containers';
import { getCurrentPeriod } from '../../utils';

export const ArchiveTabView = () => (
  <MuiContainer style={{ position: 'relative ' }} maxWidth="xl">
    <Main>
      <ArchiveTable period={getCurrentPeriod()} />
    </Main>
  </MuiContainer>
);
