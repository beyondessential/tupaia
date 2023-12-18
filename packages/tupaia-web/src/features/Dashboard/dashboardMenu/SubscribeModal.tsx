/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button, Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { useUser } from '../../../api/queries';
import { Dashboard } from '../../../types';
import { Modal, Form, TextField, Title, ModalParagraph } from '../../../components';
import { FORM_FIELD_VALIDATION, MOBILE_BREAKPOINT } from '../../../constants';
import { useSubscribeDashboard, useUnsubscribeDashboard } from '../../../api/mutations';
import { useDashboardMailingList } from '../../../utils';
import {
  MODAL_SUBSCRIBE_TEXT,
  MODAL_SUBSCRIBE_TITLE,
  MODAL_UNSUBSCRIBE_TEXT,
  MODAL_UNSUBSCRIBE_TITLE,
} from './constants';

const Wrapper = styled.div`
  width: 45rem;
  max-width: 100%;
  padding: 2.5rem 1.875rem 0rem 1.875rem;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-basis: 83.3333%;
  button {
    text-transform: none;
    padding: 0.5em 1.75em;
    font-size: 1rem;
  }
  .loading-screen {
    background-color: ${props => props.theme.palette.background.default};
    border: 0;
    button {
      padding: 0.5em 1.75em;
      font-size: 1rem;
    }
  }
`;

export const ErrorMessageText = styled(Typography)`
  font-size: 0.9rem;
  line-height: 1.3;
  margin-top: 1rem;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const SubscribeButton = styled(Button)`
  margin-left: 1.2rem;
`;

const EmailInput = styled(TextField)<{ $disabled?: boolean }>`
  width: 50%;
  margin: auto;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
  }

  ${({ $disabled, theme }) =>
    $disabled
      ? `

      .MuiInput-input {
        color: ${theme.palette.text.secondary}; 
      }
        
      .MuiInput-underline:before { border-bottom: 1px outset rgba(255, 255, 255, 0.7); transition: none;  }
      .MuiInput-underline:hover:before { border-bottom: 1px outset rgba(255, 255, 255, 0.7); }
      .MuiInput-underline:after { border-bottom-style: none; }  
      `
      : ''};
`;

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDashboard?: Dashboard;
  onToggleSubscription: () => void;
}

export const SubscribeModal = ({
  isOpen,
  onClose,
  activeDashboard,
  onToggleSubscription,
}: SubscribeModalProps) => {
  const { entityCode, projectCode } = useParams();
  const { data: user, isLoggedIn, isLoading } = useUser();
  const mailingList = useDashboardMailingList();
  const isSubscribed = mailingList ? mailingList.isSubscribed : false;
  const defaultEmail = isLoggedIn ? user.email : '';
  const formContext = useForm({
    mode: 'onChange',
    defaultValues: {
      email: defaultEmail,
    },
  });
  const {
    mutateAsync: subscribe,
    error: subscribeError,
    reset: resetSubscribe,
  } = useSubscribeDashboard(projectCode, entityCode, activeDashboard?.code);
  const {
    mutateAsync: unsubscribe,
    error: unsubscribeError,
    reset: resetUnsubscribe,
  } = useUnsubscribeDashboard(projectCode, entityCode, activeDashboard?.code);

  const handleSubmit = async data => {
    if (isSubscribed) {
      await unsubscribe(data);
    } else {
      await subscribe(data);
    }
    onToggleSubscription();
    onClose();
  };

  const handleClose = () => {
    if (isSubscribed) {
      resetUnsubscribe();
    } else {
      resetSubscribe();
    }
    onClose();
  };

  const isMutateError = !!subscribeError || !!unsubscribeError;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Wrapper>
        {activeDashboard && mailingList ? (
          <Container>
            <Form formContext={formContext} onSubmit={handleSubmit}>
              <Title align="left" variant="h5">
                {isSubscribed ? MODAL_UNSUBSCRIBE_TITLE : MODAL_SUBSCRIBE_TITLE}
              </Title>
              <ModalParagraph align="left" gutterBottom>
                {isSubscribed ? MODAL_UNSUBSCRIBE_TEXT : MODAL_SUBSCRIBE_TEXT}
              </ModalParagraph>
              {isLoading && <SpinningLoader mt={5} />}
              <EmailInput
                name="email"
                label="Email"
                required
                defaultValue={defaultEmail}
                type="email"
                options={{ ...FORM_FIELD_VALIDATION.EMAIL }}
                inputProps={{ readOnly: isLoggedIn }}
                $disabled={isLoggedIn}
              />
              {isMutateError && (
                <ErrorMessageText color="error">
                  {isSubscribed ? unsubscribeError?.message : subscribeError?.message}
                </ErrorMessageText>
              )}
              <ButtonGroup>
                <Button variant="outlined" color="default" onClick={handleClose}>
                  Cancel
                </Button>
                <SubscribeButton type="submit" variant="contained" color="primary">
                  {isSubscribed ? 'Remove' : 'Subscribe'}
                </SubscribeButton>
              </ButtonGroup>
            </Form>
          </Container>
        ) : (
          <Container>
            <Typography color="error" gutterBottom>
              Something went wrong.
            </Typography>
          </Container>
        )}
      </Wrapper>
    </Modal>
  );
};
