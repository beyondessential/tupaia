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

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.3rem;
  right: 0.6rem;
`;

export const FormBackButton = () => {
  const history = useHistory();

  const handleClose = () => {
    if (history.location?.state?.referer) {
      history.push(history.location.state.referer);
    } else {
      history.push('/');
    }
  };
  return (
    <CloseButton color="inherit" onClick={handleClose} aria-label="close">
      <CloseIcon />
    </CloseButton>
  );
};
