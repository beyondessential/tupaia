/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TableCell } from '@material-ui/core';
import styled from 'styled-components';

export const Cell = styled(TableCell)<{
  $characterLength?: number;
}>`
  max-width: 30ch; // don't let the text take up too much space;
  word-break: ${({ $characterLength = 0 }) => ($characterLength > 30 ? 'break-word' : 'normal')};
`;
