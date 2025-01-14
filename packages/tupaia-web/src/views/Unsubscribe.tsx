import React, { useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Button, LoadingContainer } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import BaseSuccessIcon from '@material-ui/icons/CheckCircle';
import BaseErrorIcon from '@material-ui/icons/ErrorOutline';
import { useUnsubscribeDashboardMailingList } from '../api/mutations';
import { Logo } from '../layout';
import { TUPAIA_LIGHT_LOGO_SRC } from '../constants';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 90%;
  padding-top: 2rem;
`;

const SuccessIcon = styled(BaseSuccessIcon)`
  color: ${({ theme }) => theme.palette.success.main};
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
`;

const ErrorIcon = styled(BaseErrorIcon)`
  color: ${({ theme }) => theme.palette.error.main};
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
`;

const StatusMessage = styled(Typography).attrs({
  variant: 'h3',
})`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const ConfirmationMessage = styled(Typography).attrs({
  variant: 'h3',
})`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  padding-bottom: 1rem;
`;

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  padding-top: 10rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .loading-screen {
    border: 0;
    background-color: ${() =>
      window.getComputedStyle(document.body, null).getPropertyValue('background-color')};
  }
`;

const UnsubscribeFieldset = styled.fieldset`
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UnsubscribeButton = styled(Button)`
  .MuiButton-label {
    text-transform: none;
  }
`;

/**
 * This is the view that a user is taken to when clicking the unsubscribe link in an email
 */
export const Unsubscribe = () => {
  const [urlSearchParams] = useSearchParams();
  const [hasUnsubscribed, setHasUnsubscribed] = useState(false);

  const email = urlSearchParams.get('email') || '';
  const token = urlSearchParams.get('token') || '';
  const mailingListId = urlSearchParams.get('mailingListId') || '';

  const {
    mutateAsync: unsubscribe,
    error: unsubscribeError,
    isLoading: isUnsubscribeLoading,
  } = useUnsubscribeDashboardMailingList();

  const onClickUnsubscribe = async () => {
    await unsubscribe({ email, token, mailingListId });
    setHasUnsubscribed(true);
  };

  if (unsubscribeError) {
    return (
      <Container>
        <Logo logoSrc={TUPAIA_LIGHT_LOGO_SRC} />
        <StatusContainer>
          <ErrorIcon />
          <StatusMessage>Unsubscribe failed: {unsubscribeError.message}</StatusMessage>
        </StatusContainer>
      </Container>
    );
  }

  if (hasUnsubscribed) {
    return (
      <Container>
        <Logo logoSrc={TUPAIA_LIGHT_LOGO_SRC} />
        <StatusContainer>
          <SuccessIcon />
          <StatusMessage>You have successfully unsubscribed from the mailing list</StatusMessage>
        </StatusContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Logo logoSrc={TUPAIA_LIGHT_LOGO_SRC} />
      <LoadingContainer isLoading={isUnsubscribeLoading} heading="Unsubscribing">
        <UnsubscribeFieldset>
          <ConfirmationMessage>{`Are you sure you want to unsubscribe ${email} from the mailing list?`}</ConfirmationMessage>
          <UnsubscribeButton onClick={onClickUnsubscribe}>Unsubscribe</UnsubscribeButton>
        </UnsubscribeFieldset>
      </LoadingContainer>
    </Container>
  );
};
