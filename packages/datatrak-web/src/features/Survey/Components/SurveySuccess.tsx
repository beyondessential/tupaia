import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SurveyQRCode } from '../SurveyQRCode';
import { useCurrentUserContext } from '../../../api';
import { useQRCodeLocationData } from '../SurveyQRCode/useQRCodeLocationData';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-block-size: 100%;
  padding-bottom: max(env(safe-area-inset-bottom, 0), 1.5rem);
  padding-left: max(env(safe-area-inset-left, 0), 1.5rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.5rem);
  padding-top: max(env(safe-area-inset-top, 0), 1.5rem);

  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    flex-grow: 1;
  }
`;

const Container = styled.div<{ $showQrCode?: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  text-wrap: balance;
  width: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-right: ${props => (props.$showQrCode ? '15rem' : '0')};
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
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

  ${({ theme }) => theme.breakpoints.up('sm')} {
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

export const SurveySuccess = ({ text, title, children }: SurveySuccessProps) => {
  const { isLoggedIn } = useCurrentUserContext();
  const qrCodeEntitiesCreated = useQRCodeLocationData();
  return (
    <Wrapper>
      <Container $showQrCode={!!qrCodeEntitiesCreated}>
        <StyledImg aria-hidden src="/tupaia-high-five.svg" />
        <Title>{title}</Title>
        {isLoggedIn && (
          <>
            <Text>{text}</Text>
            {children}
          </>
        )}
      </Container>
      {qrCodeEntitiesCreated && <SurveyQRCode qrCodeEntitiesCreated={qrCodeEntitiesCreated} />}
    </Wrapper>
  );
};
