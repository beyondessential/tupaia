import React, { ReactNode } from 'react';
import { Dialog, Paper as MuiPaper, useTheme, useMediaQuery, IconButton } from '@material-ui/core';
import MuiCloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';

interface ModalProps {
  children?: ReactNode;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.1rem;
  right: 0.2rem;
  z-index: 1;
`;

const Paper = styled(MuiPaper)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow-x: hidden;
  padding: 1.2rem;
  pointer-events: auto;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.9);
  overflow-y: auto;
  max-width: 100%;
  min-width: 18.75rem;
  // Prevent width from animating.
  transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
`;

export const Modal = ({ children, isOpen, onClose, className }: ModalProps) => {
  // make the modal full screen at small screen sizes
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  // keep the className to modify any modal
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperComponent={Paper}
      fullScreen={fullScreen}
      className={className}
      disablePortal
    >
      <CloseButton onClick={onClose}>
        <MuiCloseIcon />
      </CloseButton>
      {children}
    </Dialog>
  );
};
