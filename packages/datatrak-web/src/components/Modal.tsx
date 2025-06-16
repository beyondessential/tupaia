import React from 'react';
import styled from 'styled-components';
import { Dialog, Paper, DialogProps } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@tupaia/ui-components';

const Wrapper = styled(Paper)`
  padding: 2rem;
  max-inline-size: 100%;
`;

export const ModalCloseButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.primary};
  position: absolute;
  inset-block-start: 0.1rem;
  inset-inline-end: 0.1rem;
  z-index: 1;
`;

export const ModalBody = styled.div`
  padding-block-start: 1rem;
`;

interface ModalProps extends DialogProps {
  onClose: () => void;
}

export const Modal = ({ open, onClose, children, ...props }: ModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} PaperComponent={Wrapper} disablePortal {...props}>
      <ModalCloseButton onClick={onClose}>
        <CloseIcon color="inherit" style={{ fontSize: '2rem' }} />
      </ModalCloseButton>
      <ModalBody>{children}</ModalBody>
    </Dialog>
  );
};
