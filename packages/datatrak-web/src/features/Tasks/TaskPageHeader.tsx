import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { ArrowLeftIcon, Button, TaskIcon } from '../../components';
import { useFromLocation, useIsMobile } from '../../utils';

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
`;

const Wrapper = styled(SafeAreaColumn)`
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
  inline-size: 100%;
  justify-content: flex-end;
`;

interface TaskPageHeaderProps extends React.ComponentPropsWithoutRef<typeof Wrapper> {
  title: string;
  backTo?: string;
}

export const TaskPageHeader = ({ backTo, children, title, ...props }: TaskPageHeaderProps) => {
  const from = useFromLocation();
  const isMobile = useIsMobile();
  return (
    <Wrapper {...props}>
      {!isMobile && (
        <Container>
          <BackButton to={from || backTo}>
            <ArrowLeftIcon />
          </BackButton>
          <HeadingContainer>
            <TaskIcon />
            <Title>{title}</Title>
          </HeadingContainer>
        </Container>
      )}
      <ContentWrapper>{children}</ContentWrapper>
    </Wrapper>
  );
};
