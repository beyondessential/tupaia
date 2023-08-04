/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { Dialog, Paper as MuiPaper, useTheme, useMediaQuery } from '@material-ui/core';
import MuiCloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import { IconButton } from '@tupaia/ui-components';

interface ModalProps {
  children?: ReactNode;
  onClose: () => void;
  isOpen: boolean;
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow-x: hidden;
  padding: 2rem;
`;

const CloseIcon = styled(MuiCloseIcon)`
  width: 2rem;
  height: 2rem;
`;

const CloseButton = styled(IconButton)`
  background-color: transparent;
  min-width: initial;
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
`;

const Paper = styled(MuiPaper)`
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 0;
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.9);
  overflow-y: auto;
  max-width: 100%;
  min-width: 18.75rem;
  // Prevent width from animating.
  transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
`;

export const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  // make the modal full screen at small screen sizes
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperComponent={Paper}
      fullScreen={fullScreen}
      disablePortal
    >
      <Wrapper id="overlay-wrapper">
        <CloseButton onClick={onClose} color="default">
          <CloseIcon />
        </CloseButton>
        {children}
      </Wrapper>
    </Dialog>
  );
};
