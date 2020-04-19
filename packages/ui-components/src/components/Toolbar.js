/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiButton from '@material-ui/core/Button';
import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import MuiButtonGroup from '@material-ui/core/ButtonGroup';
import * as COLORS from '../theme/colors';

const StyledDiv = styled.div`
  background-color: ${COLORS.DARK_BLUE};
  color: ${COLORS.WHITE};
  padding: 12px 0;
  letter-spacing: 0;

  .MuiButton-root {
    color: #97b7ce;
    font-weight: 500;
    font-size: 18px;
    line-height: 1;
    letter-spacing: 0;
    padding: 9px 32px;
  }

  .active {
    color: white;
  }

  .MuiButtonGroup-groupedText:not(:last-child) {
    border-color: #7ea7c3;
  }

  .MuiButtonGroup-groupedText:last-child {
    padding-right: 0;
  }

  .MuiButtonGroup-groupedText:first-child {
    padding-left: 0;
  }
`;

export const Toolbar = () => (
  <StyledDiv>
    <Container maxWidth="lg">
      <MuiButtonGroup variant="text">
        <MuiButton className="active">Weekly Case Data</MuiButton>
        <MuiButton>Event-based Data</MuiButton>
      </MuiButtonGroup>
    </Container>
  </StyledDiv>
);