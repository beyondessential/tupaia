/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Button } from '@material-ui/core';
import styled from 'styled-components';

export const CellButton = styled(Button)`
  color: inherit;
  text-decoration: none;
  text-transform: none;
  font-size: inherit;
  // override the padding to match the padding of the cell, so that the button fills the whole cell
  padding: 0.5rem 1.56rem;
  .MuiTableCell-root:has(&) {
    padding: 0;
  }
`;
