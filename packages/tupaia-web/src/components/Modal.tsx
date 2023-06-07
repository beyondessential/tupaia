/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  Typography,
  Paper as MuiPaper,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import MuiCloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';

interface ModalProps {
  children?: ReactNode;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

const Wrapper = styled.div`
  text-align: center;
  overflow-x: hidden;
  padding: 2em;
`;

const CloseIcon = styled(MuiCloseIcon)`
  width: 1.2em;
  height: 1.2em;
`;

const CloseButton = styled(Button)`
  background-color: transparent;
  min-width: initial;
  padding: 0;
  position: absolute;
  top: 0.6em;
  right: 0.6em;
  &:hover,
  &:focus {
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.palette.text.primary};
  }
`;

const Paper = styled(MuiPaper)`
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 0;
  color: rgba(255, 255, 255, 0.9);
  overflow-y: auto;
  max-width: 920px;
  min-width: 300px;
  // Prevent width from animating.
  transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
`;

export const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  // make the modal full screen at small screen sizes
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  return (
    <Dialog open={isOpen} onClose={onClose} PaperComponent={Paper} fullScreen={fullScreen}>
      <Wrapper id="overlay-wrapper">
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        {children}
      </Wrapper>
    </Dialog>
  );
};
