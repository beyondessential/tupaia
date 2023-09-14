/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Dialog, Paper } from '@material-ui/core';
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

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  z-index: 1;
`;

const Content = styled.div`
  padding-top: 1rem;
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export const Modal = ({ open, onClose, children }: ModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} PaperComponent={Wrapper} disablePortal>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>
      <Content>{children}</Content>
    </Dialog>
  );
};
