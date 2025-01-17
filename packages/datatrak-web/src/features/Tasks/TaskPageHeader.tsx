import { Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ArrowLeftIcon, Button, TaskIcon } from '../../components';
import { useFromLocation } from '../../utils';

const BackButton = styled(Button)`
  min-width: 0;
  color: ${({ theme }) => theme.palette.text.primary};
  padding: 0.7rem;
  border-radius: 50%;
  .MuiSvgIcon-root {
    font-size: 1.3rem;
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const Wrapper = styled.div`
  padding-block: 0.7rem;
  display: flex;
  align-items: self-start;
  padding-inline-end: 2.7rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-inline-end: 0.5rem;
    padding-inline-start: 0.5rem;
  }
`;

const HeadingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-inline-end: 1.2rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
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

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;

export const TaskPageHeader = ({
  title,
  children,
  backTo,
}: {
  title: string;
  children?: ReactNode;
  backTo?: string;
}) => {
  const from = useFromLocation();
  return (
    <Wrapper>
      <Container>
        <BackButton to={from || backTo} variant="text" title="Back">
          <ArrowLeftIcon />
        </BackButton>
        <HeadingContainer>
          <TaskIcon />
          <Title>{title}</Title>
        </HeadingContainer>
      </Container>
      <ContentWrapper>{children}</ContentWrapper>
    </Wrapper>
  );
};
