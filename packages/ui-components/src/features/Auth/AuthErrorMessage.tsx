import { Typography } from '@material-ui/core';
import styled from 'styled-components';

export const AuthErrorMessage = styled(Typography).attrs({
  color: 'error',
})`
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;
