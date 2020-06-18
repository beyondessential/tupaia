/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import MuiContainer from '@material-ui/core/Container';
import { Main } from '../../components';
import { OutbreaksTable, OutbreaksPanel } from '../../containers';

export const OutbreaksTabView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <MuiContainer>
      <Main>
        <OutbreaksTable handleOpen={handleOpen} />
        <OutbreaksPanel isOpen={isOpen} handleClose={handleClose} />
      </Main>
    </MuiContainer>
  );
};
