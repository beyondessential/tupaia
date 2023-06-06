/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import { To, useNavigate } from 'react-router';
import { Modal } from '../components';
import styled from 'styled-components';
import { TUPAIA_LIGHT_LOGO_SRC } from '../constants';
import { Typography } from '@material-ui/core';
import { FONT_SIZES } from '../theme';

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

interface AuthModalProps {
  children?: ReactNode;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  navigateTo?: To | number; // the path to navigate to on close, if set. Numbers are acceptable for e.g. -1 meaning back 1 route
}

export const AuthModal = ({
  children,
  onClose,
  navigateTo = -1,
  title,
  subtitle,
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
    </Modal>
  );
};
