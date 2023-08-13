import styled from 'styled-components';
import { FlexColumn } from './Layout';

export const PanelComponent = styled(FlexColumn)`
  position: relative;
  flex: 1;
  justify-content: flex-start;
  padding: 2rem;
  margin-bottom: 2rem;
  max-width: 100%;

  &.active {
    position: absolute;
    opacity: 0;
    z-index: -1;
    height: 0;
    overflow: hidden;
  }
`;
