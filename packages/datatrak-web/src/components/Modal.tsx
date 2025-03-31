import React from 'react';
import styled from 'styled-components';
import { Dialog, Paper, DialogProps } from '@material-ui/core';
import MuiCloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@tupaia/ui-components';

const Wrapper = styled(Paper)`
  padding: 2rem;
  max-inline-size: 100%;
`;

const CloseIcon = styled(MuiCloseIcon).attrs({ color: 'inherit' })`
  font-size: 2rem;
`;

const CloseButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.primary};
  position: absolute;
  inset-block-start: 0.1rem;
  inset-inline-end: 0.1rem;
  z-index: 1;
`;

const Content = styled.div`
  padding-block-start: 1rem;
`;

interface ModalProps extends DialogProps {
  onClose: () => void;
}

export const Modal = ({ open, onClose, children, ...muiProps }: ModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} PaperComponent={Wrapper} disablePortal {...muiProps}>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>
      <Content>{children}</Content>
    </Dialog>
  );
};
