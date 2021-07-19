/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';

const StyledToolbar = styled.div`
  width: 100%;
  height: 100px;
  background: white;
`;

export const Toolbar = () => {
  return (
    <StyledToolbar>
      <MuiContainer>Toolbar1</MuiContainer>
    </StyledToolbar>
  );
};
