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

const PrimaryButton = styled(Button).attrs({
  variant: 'contained',
  color: 'primary',
})`
  text-transform: none;
  font-size: 1em;
  width: 100%;
  margin-left: 0 !important;
  margin-top: 2em;
`;

const SecondaryButton = styled(OutlinedButton).attrs({
  color: 'default',
})`
  text-transform: none;
  font-size: 1em;
  width: 100%;
  margin-left: 0 !important;
  padding: 0.375em 1em; // to match the height of the primary button
  border-color: ${({ theme }) => theme.palette.text.secondary};
  ${PrimaryButton} + & {
    margin-top: 1.3em;
  }
`;

type ButtonProps = {
  onClick: () => void;
  text: string;
};
interface AuthModalProps {
  children?: ReactNode;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  navigateTo?: To | number; // the path to navigate to on close, if set. Numbers are acceptable for e.g. -1 meaning back 1 route
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
}

export const AuthModal = ({
  children,
  onClose,
  navigateTo = -1,
  title,
  subtitle,
  primaryButton,
  secondaryButton,
}: AuthModalProps) => {
  const navigate = useNavigate();
  const onCloseModal = () => {
    // navigate back to the previous route on close if no path is provided
    navigate(navigateTo as To);
    if (onClose) onClose();
  };
  // This modal will always be open in this case, because these are only visible on certain routes
  return (
    <Modal isOpen={true} onClose={onCloseModal}>
      <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia Logo" />
      <Title variant="h2">{title}</Title>
      {subtitle && <Subtitle variant="h3">{subtitle}</Subtitle>}
      {children}
      {primaryButton && (
        <PrimaryButton onClick={primaryButton.onClick}>{primaryButton.text}</PrimaryButton>
      )}
      {secondaryButton && (
        <SecondaryButton onClick={secondaryButton.onClick}>{secondaryButton.text}</SecondaryButton>
      )}
    </Modal>
  );
};
