/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { PageContainer } from '../components';
import { HEADER_HEIGHT } from '../constants';

export const Background = styled.div<{
  $backgroundImage?: string;
}>`
  width: 100%;
  height: 100%;
  background-image: ${({ $backgroundImage }) => `url(${$backgroundImage})`};
  background-position: top center;
  background-size: cover;
  min-height: calc(100vh - ${HEADER_HEIGHT});
  display: flex;
`;

export const BackgroundPageLayout = ({ backgroundImage }: { backgroundImage?: string }) => {
  return (
    <Background $backgroundImage={backgroundImage}>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </Background>
  );
};
