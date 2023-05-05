/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styled from 'styled-components';
import TopBarLogo from '../TopBarLogo';
import SearchBar from '../SearchBar';
import UserBar from '../UserBar';
import { DARK_BLUE, TOP_BAR_HEIGHT, WHITE } from '../../styles';
import { useCustomLandingPages } from '../../screens/LandingPage/useCustomLandingPages';

// Both min height and height must be specified due to bugs in Firefox flexbox
// that means that topbar height will be ignored even if using flex-basis.
const TopBarWrapper = styled.div`
  background-color: ${props => props.primaryColor};
  min-height: ${TOP_BAR_HEIGHT}px;
  height: ${TOP_BAR_HEIGHT}px;
  box-sizing: border-box;
  display: flex;
  z-index: 1000;
  position: relative;
  padding: 0 10px;
  border-bottom: 1px solid rgba(151, 151, 151, 0.3);
  > * {
    color: ${props => props.secondaryColor};
    background-color: ${props => props.primaryColor};
  }
`;

const TopBar = () => {
  const { isCustomLandingPage, customLandingPageSettings } = useCustomLandingPages();
  let primaryColor = DARK_BLUE;
  let secondaryColor = WHITE;

  // If a custom landing page is being used, use the primary and secondary colors from settings if set, else default back to the original colors
  if (isCustomLandingPage) {
    primaryColor = customLandingPageSettings.primary_hexcode || DARK_BLUE;
    secondaryColor = customLandingPageSettings.secondary_hexcode || WHITE;
  }

  return (
    <TopBarWrapper secondaryColor={secondaryColor} primaryColor={primaryColor}>
      <TopBarLogo />
      {/** only display the search bar when not in a custom landing page */}
      {!isCustomLandingPage && <SearchBar />}
      <UserBar />
    </TopBarWrapper>
  );
};

export default TopBar;
