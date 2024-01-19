/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Paper, Typography } from '@material-ui/core';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding-bottom: 10%;
`;

const Container = styled(Paper).attrs({
  elevation: 0,
})`
  padding: 1rem;
  width: 100%;
  max-width: 40rem;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  h1 {
    margin-bottom: 1rem;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1.5rem 2.5rem;
  }
`;

export const ErrorDisplay = ({
  error,
  children,
  title,
}: {
  error?: Error | null;
  children?: ReactNode;
  title;
}) => {
  return (
    <Wrapper>
      <Container>
        <Typography variant="h1">{title}</Typography>
        {error && <Typography variant="body1">{error.message}</Typography>}
        {children}
      </Container>
    </Wrapper>
  );
};
