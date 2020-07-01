/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import MuiContainer from '@material-ui/core/Container';
import { Main } from '../../components';
import { OutbreaksTable, OutbreaksPanel } from '../../containers';

export const OutbreaksTabView = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  return (
    <MuiContainer>
      <Main>
        <OutbreaksTable handlePanelOpen={() => setIsPanelOpen(true)} />
        <OutbreaksPanel isOpen={isPanelOpen} handleClose={() => setIsPanelOpen(false)} />
      </Main>
    </MuiContainer>
  );
};
