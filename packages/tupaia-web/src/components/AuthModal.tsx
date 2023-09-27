/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button } from '@tupaia/ui-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { TUPAIA_LIGHT_LOGO_SRC } from '../constants';

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

const Title = styled(Typography)`
  font-size: 2rem;
  font-weight: 500;
`;

const Subtitle = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.3;
  margin-top: 1rem;
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
