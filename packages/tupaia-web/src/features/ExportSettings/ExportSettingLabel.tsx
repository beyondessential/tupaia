import { Typography } from '@material-ui/core';
import styled from 'styled-components';

export const ExportSettingLabel = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
  padding-inline-start: 0;
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;
