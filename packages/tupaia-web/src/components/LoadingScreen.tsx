import React from 'react';
import styled from 'styled-components';
import { SpinningLoader } from '@tupaia/ui-components';

const Screen = styled.div<{
  $background: string;
}>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  background: ${props => props.$background};
  align-items: center;
  justify-content: center;
  z-index: ${Number.MAX_SAFE_INTEGER};
`;

interface LoadingScreenProps {
  isLoading: boolean;
  background?: string;
}
export const LoadingScreen = ({
  isLoading,
  background = 'rgba(0, 0, 0, 0.5)',
}: LoadingScreenProps) =>
  isLoading ? (
    <Screen $background={background}>
      <SpinningLoader />
    </Screen>
  ) : null;
