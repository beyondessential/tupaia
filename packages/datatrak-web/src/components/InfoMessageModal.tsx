import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

import { Button } from './Button';
import { Modal } from './Modal';

const Heading = styled(Typography).attrs({
  variant: 'h2',
  align: 'center',
})`
  margin-block-end: 1rem;
`;

const Wrapper = styled.div`
  max-inline-size: 27rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding-block: 1rem;
    padding-inline: 2rem;
  }
`;

const ModalButton = styled(Button)`
  &.MuiButtonBase-root.MuiButton-root {
    flex: 1;
    margin: 0;
    white-space: nowrap;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
  inline-size: 100%;
  margin-block-start: 1.5rem;
  margin-inline: auto;
  max-inline-size: 20rem;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    justify-content: center;
  }
`;

interface InfoMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  heading: string;
  message: string;
}

export const InfoMessageModal = ({ isOpen, onClose, heading, message }: InfoMessageModalProps) => (
  <Modal open={isOpen} onClose={onClose}>
    <Wrapper>
      <Heading>{heading}</Heading>
      <Typography align="center">{message}</Typography>
      <ButtonWrapper>
        <ModalButton onClick={onClose} variant="contained">
          Close
        </ModalButton>
      </ButtonWrapper>
    </Wrapper>
  </Modal>
);
