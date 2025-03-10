import styled from 'styled-components';
import { Typography } from '@material-ui/core';

export const SectionHeading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1rem;
  font-weight: 500;
  grid-column: 1 / -1;
  line-height: 1.2;
  margin-block-end: 0.75rem;
`;
