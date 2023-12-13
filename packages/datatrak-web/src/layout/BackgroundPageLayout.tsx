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
  $hideBorder?: boolean;
}>`
  width: 100%;
  height: 100%;
  background-image: ${({ $backgroundImage }) => `url(${$backgroundImage})`};
  background-position: top center;
  background-size: cover;
  min-height: ${props => {
    // Need to add 1px offset to account for the negative margin when hiding the header border
    const offset = props.$hideBorder ? `${HEADER_HEIGHT} + 1px` : HEADER_HEIGHT;
    return `calc(100vh - ${offset})`;
  }};
  display: flex;
  margin-top: ${props => (props.$hideBorder ? '-1px' : 0)};
`;

export const BackgroundPageLayout = ({
  backgroundImage,
  headerBorderHidden,
}: {
  backgroundImage?: string;
  headerBorderHidden?: boolean;
}) => {
  return (
    <Background $backgroundImage={backgroundImage} $hideBorder={headerBorderHidden}>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </Background>
  );
};
