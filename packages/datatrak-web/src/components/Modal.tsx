import React from 'react';
import styled from 'styled-components';
import { Dialog, Paper, DialogProps } from '@material-ui/core';
import MuiCloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@tupaia/ui-components';

const Wrapper = styled(Paper)`
  padding: 2rem;
  max-width: 100%;
`;

const CloseIcon = styled(MuiCloseIcon)`
  width: 2rem;
  height: 2rem;
  color: ${({ theme }) => theme.palette.text.primary};
`;

export const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  z-index: 1;
`;

export const ModalContent = styled.div`
  padding-top: 1rem;
`;

interface ModalProps extends DialogProps {
  open: boolean;
  onClose: () => void;
}

export const Modal = ({ open, onClose, children, ...muiProps }: ModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} PaperComponent={Wrapper} disablePortal {...muiProps}>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>
      <ModalContent>{children}</ModalContent>
    </Dialog>
  );
};
