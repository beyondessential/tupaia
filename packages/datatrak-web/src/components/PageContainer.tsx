import { Container } from '@material-ui/core';
import styled from 'styled-components';

export const PageContainer = styled(Container).attrs({
  maxWidth: false,
})`
  flex: 1;
  padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
  position: relative;
`;
