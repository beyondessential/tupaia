import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button } from './Button';

import { Modal } from './Modal';

const Heading = styled(Typography).attrs({
  variant: 'h2',
  align: 'center',
})`
  margin-bottom: 1rem;
`;

const Wrapper = styled.div`
  max-inline-size: 27rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2rem;
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
  margin: 1.5rem auto 0;
  max-inline-size: 20rem;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    justify-content: center;
  }
`;

interface UnavailableResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnavailableResponseModal = ({ isOpen, onClose }: UnavailableResponseModalProps) => (
  <Modal open={isOpen} onClose={onClose}>
    <Wrapper>
      <Heading>Survey response unavailable</Heading>
      <Typography align="center">This survey response is not available on this device</Typography>
      <ButtonWrapper>
        <ModalButton onClick={onClose} variant="outlined">
          Cancel
        </ModalButton>
      </ButtonWrapper>
    </Wrapper>
  </Modal>
);
