import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { TUPAIA_LIGHT_LOGO_SRC } from '../constants';
import {Title, Subtitle} from './ModalTypography'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
`;

const Logo = styled.img`
  min-width: 110px;
  margin-bottom: 3.6rem;
`;

export const AuthModalButton = styled(Button)`
  text-transform: none;
  font-size: 1rem;
  width: 22rem;
  max-width: 100%;
  margin-left: 0 !important;
  margin-top: 2rem;
`;

interface AuthModalProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AuthModalBody = ({ children, title, subtitle, className }: AuthModalProps) => {
  return (
    <Wrapper className={className}>
      <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia Logo" />
      <ErrorBoundary>
        <Title variant="h2">{title}</Title>
        {subtitle && <Subtitle variant="h3">{subtitle}</Subtitle>}
        {children}
      </ErrorBoundary>
    </Wrapper>
  );
};
