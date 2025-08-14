import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = () => {
    if (location?.state?.referer) {
      navigate(location.state.referer);
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
