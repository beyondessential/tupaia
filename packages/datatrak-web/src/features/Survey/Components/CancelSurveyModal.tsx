/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button, Modal } from '../../../components';
import { useSurveyForm } from '..';

const Wrapper = styled.div`
  max-width: 28rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2rem;
  }
`;
const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 1.3rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    justify-content: center;
  }
`;

const Heading = styled(Typography).attrs({
  variant: 'h2',
  align: 'center',
})`
  margin-bottom: 1rem;
`;

const ModalButton = styled(Button)`
  ${({ theme }) => theme.breakpoints.down('xs')} {
    & + & {
      margin: 1rem 0 0 0;
    }
  }
`;

export const CancelSurveyModal = () => {
  const { cancelModalOpen, closeCancelConfirmation } = useSurveyForm();
  return (
    <Modal open={cancelModalOpen} onClose={closeCancelConfirmation}>
      <Wrapper>
        <Heading>Survey in progress</Heading>
        <Typography align="center">
          If you exit, you will lose the progress you've made on the current survey
        </Typography>
        <ButtonWrapper>
          <ModalButton variant="outlined" to="../../" onClick={closeCancelConfirmation}>
            Exit survey
          </ModalButton>
          <ModalButton onClick={closeCancelConfirmation}>Continue survey</ModalButton>
        </ButtonWrapper>
      </Wrapper>
    </Modal>
  );
};
