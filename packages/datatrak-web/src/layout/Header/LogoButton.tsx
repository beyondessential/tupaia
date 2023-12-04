/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useMatch } from 'react-router-dom';
import { Button, CancelConfirmModal } from '../../components';
import { HEADER_HEIGHT, ROUTES } from '../../constants';

const Logo = styled(Button)`
  height: ${HEADER_HEIGHT};
  padding: 0;
  background: transparent;
  &:hover {
    background: transparent;
  }
  .MuiButton-label {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0.8rem 0.5rem;
    img {
      max-height: 100%;
    }
  }
`;

export const LogoButton = () => {
  const [surveyCancelModalIsOpen, setIsOpen] = useState(false);
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);

  const onClickLogo = e => {
    if (isSurveyScreen && !isSuccessScreen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Logo component={RouterLink} onClick={onClickLogo} to="/" title="Home">
        <img src="/datatrak-logo-black.svg" alt="tupaia-logo" />
      </Logo>
      <CancelConfirmModal isOpen={surveyCancelModalIsOpen} onClose={onClose} />
    </>
  );
};
