/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { DialogActions, Typography } from '@material-ui/core';
import { SpinningLoader, Button as UIButton } from '@tupaia/ui-components';
import { useUser } from '../../../api/queries';
import { Modal, Form, TextField, ModalParagraph } from '../../../components';
import { FORM_FIELD_VALIDATION } from '../../../constants';
import { useSubscribeDashboard, useUnsubscribeDashboard } from '../../../api/mutations';
import { useDashboardMailingList, useDashboard } from '../utils';
import {
  MODAL_SUBSCRIBE_TEXT,
  MODAL_SUBSCRIBE_TITLE,
  MODAL_UNSUBSCRIBE_TEXT,
  MODAL_UNSUBSCRIBE_TITLE,
} from './constants';

const ModalBody = styled.div`
  width: 42rem;
  max-width: 100%;
  padding: 3rem 1.5rem 0.5rem;
  text-align: left;
`;

const Button = styled(UIButton)`
  text-transform: none;
  font-size: 0.875rem;
  padding: 0.3rem 1rem;
`;

const EmailInput = styled(TextField)<{ $disabled?: boolean }>`
  width: 21rem;
  max-width: 100%;
  margin: 0 auto 2rem;
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

export const ErrorMessageText = styled(Typography)`
  font-size: 0.9rem;
  line-height: 1.3;
  margin-top: 1rem;
`;

export const SubscribeModal = () => {
  const { activeDashboard, subscribeModalOpen, toggleSubscribeModal } = useDashboard();
  const { entityCode, projectCode } = useParams();
  const { data: user, isLoggedIn, isSuccess } = useUser();
  const mailingList = useDashboardMailingList();
  const isSubscribed = mailingList ? mailingList.isSubscribed : false;
  const defaultEmail = isLoggedIn ? user.email : '';
  const formContext = useForm({
    mode: 'onChange',
  });
  const { mutateAsync: subscribe, error: subscribeError } = useSubscribeDashboard(
    projectCode,
    entityCode,
    activeDashboard?.code,
  );
  const { mutateAsync: unsubscribe, error: unsubscribeError } = useUnsubscribeDashboard(
    projectCode,
    entityCode,
    activeDashboard?.code,
  );

  const handleSubmit = async data => {
    if (isSubscribed) {
      await unsubscribe(data);
    } else {
      await subscribe(data);
    }
    toggleSubscribeModal();
  };

  const isMutateError = !!subscribeError || !!unsubscribeError;

  let ModalContent = <SpinningLoader m={5} />;

  if (isSuccess) {
    ModalContent = (
      <Form formContext={formContext} onSubmit={handleSubmit}>
        <ModalParagraph>
          {isSubscribed ? MODAL_UNSUBSCRIBE_TEXT : MODAL_SUBSCRIBE_TEXT}
        </ModalParagraph>
        <EmailInput
          defaultValue={defaultEmail}
          name="email"
          label="Email"
          required
          type="email"
          options={{ ...FORM_FIELD_VALIDATION.EMAIL }}
          inputProps={{ readOnly: isLoggedIn }}
          $disabled={isLoggedIn}
        />
      </Form>
    );
  }

  if (isMutateError) {
    ModalContent = (
      <ErrorMessageText color="error">
        {isSubscribed ? unsubscribeError?.message : subscribeError?.message}
      </ErrorMessageText>
    );
  }

  if (!activeDashboard && mailingList) {
    ModalContent = (
      <Typography color="error" gutterBottom>
        Something went wrong.
      </Typography>
    );
  }

  return (
    <Modal isOpen={subscribeModalOpen} onClose={toggleSubscribeModal}>
      <ModalBody>
        <Typography variant="h1">
          {isSubscribed ? MODAL_UNSUBSCRIBE_TITLE : MODAL_SUBSCRIBE_TITLE}
        </Typography>
        {ModalContent}
        <DialogActions>
          <Button onClick={toggleSubscribeModal} variant="text" color="default">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {isSubscribed ? 'Remove' : 'Join'}
          </Button>
        </DialogActions>
      </ModalBody>
    </Modal>
  );
};
