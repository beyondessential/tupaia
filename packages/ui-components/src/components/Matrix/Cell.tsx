/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TableCell } from '@material-ui/core';
import styled from 'styled-components';
import { getFullHex } from './utils';

export const Cell = styled(TableCell)`
  border-width: 0 1px 1px;
  border-style: none solid solid;
  border-color: ${({ theme }) => getFullHex(theme.palette.text.primary)}33;
  min-width: 6rem; // set a min-width so that the cell doesn't shrink too much and wrap text too much
  max-width: 12rem;
`;
