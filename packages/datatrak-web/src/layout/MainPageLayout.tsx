/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../constants';
import { Header } from '.';
import { MobileAppPrompt, SurveyResponseModal } from '../features';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.palette.background.default};
  min-height: 100vh;

  + .notistack-SnackbarContainer {
    top: calc(1rem + ${HEADER_HEIGHT});
  }
`;

export const MainPageLayout = () => {
  return (
    <PageWrapper>
      <Header />
      <Outlet />
      <MobileAppPrompt />
      <SurveyResponseModal />
    </PageWrapper>
  );
};
