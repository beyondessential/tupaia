import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  headingText?: string | null;
  bodyText?: string | null;
  confirmText?: string | null;
  cancelText?: string | null;
  confirmPath?: string | number;
  onConfirm?: () => void;
}

export const CancelConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  headingText = 'Survey in progress',
  bodyText = "If you exit, you will lose the progress you've made on the current survey",
  confirmText = 'Exit survey',
  cancelText = 'Continue survey',
  confirmPath = '/',
}: CancelConfirmModalProps) => {
  const navigate = useNavigate();
  const handleConfirmPath = () => {
    onClose();
    if (typeof confirmPath === 'string') {
      navigate(confirmPath); // Navigate to the specified path
    } else if (typeof confirmPath === 'number') {
      navigate(confirmPath); // Navigate by delta
    }
  };
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Wrapper>
        <Heading>{headingText}</Heading>
        <Typography align="center">{bodyText}</Typography>
        <ButtonWrapper>
          <ModalButton onClick={onClose} variant="outlined">
            {cancelText}
          </ModalButton>
          <ModalButton onClick={onConfirm || handleConfirmPath}>{confirmText}</ModalButton>
        </ButtonWrapper>
      </Wrapper>
    </Modal>
  );
};
