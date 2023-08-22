/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useHomeUrl } from '../utils';

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.3rem;
  right: 0.6rem;
`;

export const FormBackButton = () => {
  const { navigateToHomeUrl } = useHomeUrl();
  const { push, location } = useHistory();

  const handleClose = () => {
    if (location?.state?.referer) {
      push(location.state.referer);
    } else {
      navigateToHomeUrl();
    }
  };
  return (
    <CloseButton color="inherit" onClick={handleClose} aria-label="close">
      <CloseIcon />
    </CloseButton>
  );
};
