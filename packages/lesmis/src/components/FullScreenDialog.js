/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const Header = styled.div`
  position: relative;
  padding: 2.375rem 1.875rempx;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

export const DialogHeader = ({ title, handleClose, className }) => (
  <Header className={className}>
    <Typography variant="h2">{title}</Typography>
    <CloseButton color="inherit" onClick={handleClose} aria-label="close">
      <CloseIcon />
    </CloseButton>
  </Header>
);

DialogHeader.propTypes = {
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

DialogHeader.defaultProps = {
  className: null,
};
