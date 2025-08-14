import { Typography } from '@material-ui/core';
import styled from 'styled-components';

export const ExportSubtitle = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 0.875rem;
  line-height: 1.4;
  margin-top: 0.3rem;
`;
