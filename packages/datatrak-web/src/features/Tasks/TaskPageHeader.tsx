import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { ArrowLeftIcon, Button, PageContainer, TaskIcon } from '../../components';
import { useFromLocation } from '../../utils';

const BackButton = styled(Button).attrs({
  title: 'Back',
  variant: 'text',
})`
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

const Wrapper = styled(PageContainer)`
  align-items: self-start;
  display: flex;
  flex: initial;
  gap: 1rem;
  padding-block: 0.7rem;
  position: initial;
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
  align-items: center;
  display: flex;
  flex: 1;
  gap: 1rem;
  justify-content: flex-end;
  width: 100%;
`;

interface TaskPageHeaderProps extends React.ComponentPropsWithoutRef<typeof Wrapper> {
  title: string;
  backTo?: string;
}

export const TaskPageHeader = ({ backTo, children, title, ...props }: TaskPageHeaderProps) => {
  const from = useFromLocation();
  return (
    <Wrapper {...props}>
      <Container>
        <BackButton to={from || backTo}>
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
