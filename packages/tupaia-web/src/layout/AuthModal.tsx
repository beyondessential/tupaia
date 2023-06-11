/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import { Modal } from '../components';
import styled from 'styled-components';
import { TUPAIA_LIGHT_LOGO_SRC } from '../constants';
import { Typography } from '@material-ui/core';
import { Button, OutlinedButton } from '@tupaia/ui-components';
import { useNavigateBack } from '../utils/useNavigateBack.ts';

const Logo = styled.img`
  min-width: 110px;
  margin-bottom: 3.6rem;
`;

const Title = styled(Typography)`
  font-size: 2rem;
  font-weight: 500;
`;

const Subtitle = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.3;
  margin-top: 1rem;
`;

export const ModalButton = styled(Button)`
  text-transform: none;
  font-size: 1rem;
  width: 100%;
  margin-left: 0 !important;
  margin-top: 2rem;
`;

export const ModalCancelButton = styled(OutlinedButton).attrs({
  color: 'default',
})`
  text-transform: none;
  font-size: 1rem;
  width: 100%;
  margin-left: 0 !important;
  padding: 0.375rem 1rem; // to match the height of the primary button
  border-color: ${({ theme }) => theme.palette.text.secondary};
  ${ModalButton} + & {
    margin-top: 1.3rem;
  }
`;

interface AuthModalProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthModal = ({ children, title, subtitle }: AuthModalProps) => {
  const navigateBack = useNavigateBack();
  return (
    <Modal isOpen={true} onClose={navigateBack}>
      <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia Logo" />
      <Title variant="h2">{title}</Title>
      {subtitle && <Subtitle variant="h3">{subtitle}</Subtitle>}
      {children}
    </Modal>
  );
};
