/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TableCell } from '@material-ui/core';
import styled from 'styled-components';

export const Cell = styled(TableCell)<{
  $characterLength?: number;
}>`
  min-width: ${({ $characterLength = 0 }) =>
    $characterLength > 30
      ? '23ch'
      : '12ch'}; // if the text is long, so that the cell doesn't wrap too much, make it wider
  max-width: 30ch; // don't let the text take up too much space;
  word-break: ${({ $characterLength = 0 }) => ($characterLength > 30 ? 'break-word' : 'normal')};
  white-space: pre-line;
`;

export const HeaderCell = styled(Cell)`
  line-height: 1.4;
  z-index: 3; // set the z-index of the first cell to be above the rest of the column header cells so that it doesn't get covered on horizontal scroll
  &:first-child {
    z-index: 4; // set the z-index of the first cell to be above the rest of the column header cells so that it doesn't get covered on horizontal scroll
    max-width: 12rem; // set the max-width of the first cell so that on larger screens the row header column doesn't take up too much space
  }
`;
