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
