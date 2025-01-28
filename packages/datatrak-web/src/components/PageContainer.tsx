import { Container } from '@material-ui/core';
import styled from 'styled-components';

export const PageContainer = styled(Container).attrs({
  maxWidth: false,
})`
  position: relative;
  flex: 1;
  padding: 0 1.25rem;
`;
