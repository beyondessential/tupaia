import { Container } from '@material-ui/core';
import styled from 'styled-components';

export const PageContainer = styled(Container).attrs({
  maxWidth: false,
})`
  flex: 1;
  padding-block: 0;
  padding-inline: 1.25rem;
  position: relative;
`;
