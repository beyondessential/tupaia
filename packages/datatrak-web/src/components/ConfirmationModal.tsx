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
  gap: 1rem;

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
  &.MuiButtonBase-root.MuiButton-root {
    flex: 1;
    margin: 0;
  }
`;

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  heading?: NonNullable<React.ReactNode>;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  heading = 'Survey in progress',
  description = 'If you exit, you will lose the progress you’ve made on the current survey',
  confirmLabel = 'Exit survey',
  cancelLabel = 'Continue survey',
}: ConfirmationModalProps) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Wrapper>
        <Heading>{heading}</Heading>
        <Typography align="center">{description}</Typography>
        <ButtonWrapper>
          <ModalButton onClick={onClose} variant="outlined">
            {cancelLabel}
          </ModalButton>
          <ModalButton onClick={onConfirm}>{confirmLabel}</ModalButton>
        </ButtonWrapper>
      </Wrapper>
    </Modal>
  );
};
