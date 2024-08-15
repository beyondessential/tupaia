/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { TaskIcon } from '../../components';

const Wrapper = styled.div`
  padding-block: 0.7rem;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down('xs')} {
    flex-direction: column;
    align-items: flex-start;
    padding-inline-start: 1.5rem;
  }
`;

const HeadingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-inline-end: 1.2rem;
  ${({ theme }) => theme.breakpoints.down('xs')} {
    margin-block-start: 0.5rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1.5rem;
  margin-inline-start: 0.7rem;
  ${({ theme }) => theme.breakpoints.down('xs')} {
    font-size: 1.2rem;
  }
`;

export const TaskPageHeader = ({ title, children }: { title: string; children?: ReactNode }) => {
  return (
    <Wrapper>
      <HeadingContainer>
        <TaskIcon />
        <Title>{title}</Title>
      </HeadingContainer>
      {children}
    </Wrapper>
  );
};
