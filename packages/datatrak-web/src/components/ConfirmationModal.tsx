import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button } from './Button';
import { Modal } from './Modal';

const Wrapper = styled.div`
  max-inline-size: 27rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
  inline-size: 100%;
  margin: 1.5rem auto 0;
  max-inline-size: 20rem;

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
    white-space: nowrap;
  }
`;

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: React.MouseEventHandler<HTMLElement>;
  onCancel?: React.MouseEventHandler<HTMLElement>;
  heading: NonNullable<React.ReactNode>;
  description: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  heading,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmationModalProps) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Wrapper>
        <Heading>{heading}</Heading>
        <Typography align="center">{description}</Typography>
        <ButtonWrapper>
          <ModalButton onClick={onCancel ?? onClose} variant="outlined">
            {cancelLabel}
          </ModalButton>
          <ModalButton onClick={onConfirm}>{confirmLabel}</ModalButton>
        </ButtonWrapper>
      </Wrapper>
    </Modal>
  );
};
