/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';

export const ExportSettingLabel = styled.legend`
  color: ${({ theme }) => theme.palette.text.primary};
  padding-inline-start: 0;
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;
