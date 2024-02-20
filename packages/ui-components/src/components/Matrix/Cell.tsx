/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TableCell } from '@material-ui/core';
import styled from 'styled-components';
import { getFullHex } from './utils';

export const Cell = styled(TableCell)<{
  $characterLength?: number;
}>`
  border-width: 0 1px 1px;
  border-style: none solid solid;
  border-color: ${({ theme }) => getFullHex(theme.palette.text.primary)}33;
  min-width: ${({ $characterLength = 0 }) =>
    $characterLength > 30
      ? '20ch'
      : '14ch'}; // if the text is long, so that the cell doesn't wrap too much, make it wider
  max-width: 30ch; // don't let the text take up too much space;
  word-break: break-word;
`;
