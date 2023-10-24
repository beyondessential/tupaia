/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Button, PageContainer } from '../components';
import { HEADER_HEIGHT } from '../constants';
import { UserMenu } from './UserMenu';
import { useSurveyForm } from '../features';

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
  const { surveyCode } = useParams();
  const { openCancelConfirmation, isSuccessScreen } = useSurveyForm();
  const isActiveSurvey = !!surveyCode && !isSuccessScreen;
  const onClickLogo = () => {
    if (surveyCode && !isSuccessScreen) {
      openCancelConfirmation();
    }
  };
  return (
    <Wrapper>
      <Container>
        <LogoButton
          component={isActiveSurvey ? undefined : RouterLink}
          onClick={onClickLogo}
          to={isActiveSurvey ? undefined : '/'}
          title="Home"
        >
          <img src="/datatrak-logo-black.svg" alt="tupaia-logo" />
        </LogoButton>
        <UserMenu />
      </Container>
    </Wrapper>
  );
};
