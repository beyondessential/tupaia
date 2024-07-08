/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { FlexStart, IconButton } from '@tupaia/ui-components';
import styled from 'styled-components';
import { Close } from '@material-ui/icons';

const Header = styled(FlexStart)`
  position: relative;
  padding: 1.1rem 1.3rem 0.9rem;
`;

const Title = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: 1rem;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
  color: ${props => props.theme.palette.text.secondary};
`;

export const ModalHeader = ({ title, onClose, children }) => (
  <Header>
    {title && <Title variant="h2">{title}</Title>}
    {children}
    <CloseButton onClick={onClose}>
      <Close />
    </CloseButton>
  </Header>
);

ModalHeader.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

ModalHeader.defaultProps = {
  children: null,
  title: null,
};
