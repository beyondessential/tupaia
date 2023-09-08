/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Dialog, Paper, Typography } from '@material-ui/core';
import MuiCloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@tupaia/ui-components';

const Wrapper = styled(Paper)`
  padding: 4.25rem;
  width: 100%;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    width: 29rem;
  }
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

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-weight: 600;
  text-align: center;
  font-size: 1rem;
`;

const Content = styled.div`
  padding-top: 1rem;
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
}

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} PaperComponent={Wrapper} disablePortal>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>
      <Heading>{title}</Heading>
      <Content>{children}</Content>
    </Dialog>
  );
};
