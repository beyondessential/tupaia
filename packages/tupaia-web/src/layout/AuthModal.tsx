/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import { To, useNavigate } from 'react-router';
import { Modal } from '../components';
import styled from 'styled-components';
import { TUPAIA_LIGHT_LOGO_SRC } from '../constants';
import { Button, Typography } from '@material-ui/core';
import { FONT_SIZES } from '../theme';
import { OutlinedButton } from '@tupaia/ui-components';

const Logo = styled.img`
  min-width: 110px;
  margin-top: 1.8em;
  margin-bottom: 3em;
`;

const Title = styled(Typography)`
  font-size: ${FONT_SIZES.viewTitle};
  font-weight: 500;
`;

const Subtitle = styled(Typography)`
  font-size: 1em;
  margin-top: 1.4em;
`;

export const ModalButton = styled(Button)`
  text-transform: none;
  font-size: 1em;
  width: 100%;
  margin-left: 0 !important;
  margin-top: 2em;
`;

export const ModalCancelButton = styled(OutlinedButton).attrs({
  color: 'default',
})`
  text-transform: none;
  font-size: 1em;
  width: 100%;
  margin-left: 0 !important;
  padding: 0.375em 1em; // to match the height of the primary button
  border-color: ${({ theme }) => theme.palette.text.secondary};
  ${ModalButton} + & {
    margin-top: 1.3em;
  }
`;

interface AuthModalProps {
  children?: ReactNode;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal = ({ children, title, subtitle, onClose }: AuthModalProps) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia Logo" />
      <Title variant="h2">{title}</Title>
      {subtitle && <Subtitle variant="h3">{subtitle}</Subtitle>}
      {children}
    </Modal>
  );
};
