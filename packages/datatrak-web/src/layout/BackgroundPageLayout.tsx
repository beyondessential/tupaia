/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet } from 'react-router';
import styled, { css } from 'styled-components';
import { PageContainer } from '../components';
import { HEADER_HEIGHT } from '../constants';

export const Background = styled.div<{
  $backgroundImage?: string;
  $mobileBackgroundImage?: string;
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
  ${({ theme, $mobileBackgroundImage }) =>
    $mobileBackgroundImage &&
    css`
      ${theme.breakpoints.down('sm')} {
        background-image: url(${$mobileBackgroundImage});
      }
    `}
  }
`;

export const BackgroundPageLayout = ({
  backgroundImage,
  mobileBackgroundImage,
  headerBorderHidden,
}: {
  backgroundImage?: string;
  mobileBackgroundImage?: string;
  headerBorderHidden?: boolean;
}) => {
  return (
    <Background
      $backgroundImage={backgroundImage}
      $mobileBackgroundImage={mobileBackgroundImage}
      $hideBorder={headerBorderHidden}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </Background>
  );
};
