/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Paper, Typography } from '@material-ui/core';

const Wrapper = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  box-shadow: none;
  padding: 3rem 1rem;
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

interface AuthViewWrapperProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AuthViewWrapper = ({ children, title, subtitle, className }: AuthViewWrapperProps) => {
  return (
    <Wrapper className={className}>
      <Title variant="h2">{title}</Title>
      {subtitle && <Subtitle variant="h3">{subtitle}</Subtitle>}
      {children}
    </Wrapper>
  );
};
