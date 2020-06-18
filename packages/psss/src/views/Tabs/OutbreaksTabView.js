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
  const handlePanelOpen = () => {
    setIsPanelOpen(true);
  };
  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };
  return (
    <MuiContainer>
      <Main>
        <OutbreaksTable handlePanelOpen={handlePanelOpen} />
        <OutbreaksPanel isOpen={isPanelOpen} handleClose={handlePanelClose} />
      </Main>
    </MuiContainer>
  );
};
