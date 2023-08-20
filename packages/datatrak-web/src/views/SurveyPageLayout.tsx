/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router';
import { PageContainer } from '../components';
import { HEADER_HEIGHT } from '../constants';

const Background = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/page-background.svg');
  background-position: center;
  background-size: cover;
  min-height: calc(100vh - ${HEADER_HEIGHT});
`;

export const SurveyPageLayout = () => {
  return (
    <Background>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </Background>
  );
};
