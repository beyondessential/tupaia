import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { DialogActions, Typography } from '@material-ui/core';
import { SpinningLoader, Button as UIButton } from '@tupaia/ui-components';
import { useUser } from '../../../api/queries';
import { Modal, Form, TextField, ModalParagraph } from '../../../components';
import { FORM_FIELD_VALIDATION } from '../../../constants';
import { useSubscribeDashboard, useUnsubscribeDashboard } from '../../../api/mutations';
import { useDashboardMailingList, useDashboardContext } from '../utils';

const ModalForm = styled(Form)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  inline-size: 42rem;
  max-inline-size: 100%;
  min-block-size: 18rem;
  padding-block: 3rem 0.5rem;
  padding-inline: 1.5rem;
  text-align: start;
`;

const Button = styled(UIButton)`
  text-transform: none;
  font-size: 0.875rem;
  padding: 0.3rem 1.1rem;
`;

const EmailInput = styled(TextField)<{ $disabled?: boolean }>`
  width: 21rem;
  max-width: 100%;
  margin: 0 auto 2rem;
  ${({ $disabled, theme }) =>
    $disabled &&
    css`
      .MuiInput-input {
        color: ${theme.palette.text.secondary};
      }
      .MuiInput-root:before,
      .MuiInput-root:hover:before,
      .MuiInput-root:after {
        border-bottom: 1px solid ${theme.palette.divider};
      }
    `}
`;

export const SubscribeModal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeDashboard, subscribeModalOpen, toggleSubscribeModal } = useDashboardContext();
  const queryClient = useQueryClient();
  const { entityCode, projectCode } = useParams();
  const { data: user, isLoggedIn, isLoading } = useUser();
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
    setIsSubmitting(true);
    if (isSubscribed) {
      await unsubscribe(data);
    } else {
      await subscribe(data);
    }
    setIsSubmitting(false);
    toggleSubscribeModal();
    queryClient.invalidateQueries(['dashboards']);
  };

  const getModalContent = () => {
    if (isLoading) {
      return <SpinningLoader m={5} />;
    }

    if (!activeDashboard && mailingList) {
      return <Typography color="error">Something went wrong</Typography>;
    }

    if (subscribeError || unsubscribeError) {
      return (
        <Typography color="error">
          {isSubscribed ? unsubscribeError?.message : subscribeError?.message}
        </Typography>
      );
    }

    return (
      <>
        <ModalParagraph>
          {isSubscribed
            ? 'You have already joined this dashboards mailing list. If you would like to remove yourself from dashboard updates, please confirm your email below and click ‘Remove’.'
            : 'By entering your email address you will receive an email export of this dashboard from the admin. This export will include a PDF report with the details of this dashboard. This will allow you to be notified via email when important things are happening!'}
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
      </>
    );
  };

  return (
    <Modal isOpen={subscribeModalOpen} onClose={toggleSubscribeModal}>
      <ModalForm formContext={formContext} onSubmit={handleSubmit}>
        <Typography variant="h1">
          {isSubscribed
            ? 'You’re subscribed! Would you like to unsubscribe from the dashboard mailing list?'
            : 'Subscribe to dashboard mailing group'}
        </Typography>
        {getModalContent()}
        <DialogActions>
          <Button onClick={toggleSubscribeModal} variant="text" color="default">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" isLoading={isSubmitting}>
            {isSubscribed ? 'Remove' : 'Join'}
          </Button>
        </DialogActions>
      </ModalForm>
    </Modal>
  );
};
