/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useMatch } from 'react-router-dom';
import { Button, PageContainer, CancelConfirmModal } from '../components';
import { HEADER_HEIGHT, ROUTES } from '../constants';
import { UserMenu } from './UserMenu';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  width: 100%;
  box-shadow: inset 0 0 1px #333;
`;

const Container = styled(PageContainer).attrs({
  maxWidth: false,
})`
  position: relative;
  z-index: 1;
  height: ${HEADER_HEIGHT};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoButton = styled(Button)`
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

export const Header = () => {
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
    <Wrapper>
      <Container>
        <LogoButton component={RouterLink} onClick={onClickLogo} to="/" title="Home">
          <img src="/datatrak-logo-black.svg" alt="tupaia-logo" />
        </LogoButton>
        <UserMenu />
      </Container>
      <CancelConfirmModal isOpen={surveyCancelModalIsOpen} onClose={onClose} />
    </Wrapper>
  );
};
