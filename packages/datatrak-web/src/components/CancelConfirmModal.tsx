/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button } from './Button';
import { Modal } from './Modal';

const Wrapper = styled.div`
  max-width: 28rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  max-width: 20rem;
  margin: 1.5rem auto 0;
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
  flex: 1;
  ${({ theme }) => theme.breakpoints.down('xs')} {
    & + & {
      margin: 0 0 1rem 0;
    }
  }
`;

export const CancelConfirmModal = ({
  isOpen,
  onClose,
  headingText = 'Survey in progress',
  bodyText = "If you exit, you will lose the progress you've made on the current survey",
  confirmText = 'Exit survey',
  cancelText = 'Continue survey',
  confirmLink = '/',
}) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Wrapper>
        <Heading>{headingText}</Heading>
        <Typography align="center">{bodyText}</Typography>
        <ButtonWrapper>
          <ModalButton onClick={onClose} variant="outlined">
            {cancelText}
          </ModalButton>
          <ModalButton to={confirmLink} onClick={onClose}>
            {confirmText}
          </ModalButton>
        </ButtonWrapper>
      </Wrapper>
    </Modal>
  );
};
