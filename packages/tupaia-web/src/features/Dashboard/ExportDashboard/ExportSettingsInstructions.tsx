/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Typography } from '@material-ui/core';
import styled from 'styled-components';

export const ExportSettingsInstructions = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 0.825rem;
  line-height: 1.4;
`;
