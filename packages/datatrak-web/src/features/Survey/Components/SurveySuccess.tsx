/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SurveyQRCode } from '../SurveyQRCode';
import { useCurrentUserContext } from '../../../api';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    flex: 1;
  }
`;

const StyledImg = styled.img`
  aspect-ratio: 1;
  width: 23rem;
  max-width: 80%;
  max-height: 50%;
  margin-block-end: 2.75rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.375rem;
  font-weight: 600;
  text-align: center;
  margin-block-end: 1rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    font-size: 1.9rem;
    margin-block-end: 1.19rem;
  }
`;

const Text = styled(Typography)`
  max-width: 34.6rem;
  width: 100%;
  text-align: center;
  margin-block-end: 1.875rem;
`;

interface SurveySuccessProps {
  text: string;
  title: string;
  showQrCode?: boolean;
  children: React.ReactNode;
}

export const SurveySuccess = ({ text, title, showQrCode, children }: SurveySuccessProps) => {
  const { isLoggedIn } = useCurrentUserContext();

  return (
    <Wrapper>
      <Container>
        <StyledImg src="/tupaia-high-five.svg" alt="Survey submit success" />
        <Title>{title}</Title>
        {isLoggedIn && (
          <>
            <Text>{text}</Text>
            {children}
          </>
        )}
      </Container>
      {showQrCode && <SurveyQRCode />}
    </Wrapper>
  );
};
