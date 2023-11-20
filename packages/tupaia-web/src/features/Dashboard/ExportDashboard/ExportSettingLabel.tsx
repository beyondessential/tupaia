/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Typography } from '@material-ui/core';
import styled from 'styled-components';

export const ExportSettingLabel = styled(Typography).attrs({
  variant: 'h3',
})`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;
