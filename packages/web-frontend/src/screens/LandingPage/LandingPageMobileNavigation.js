/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { Button } from '@tupaia/ui-components';
import { TOP_BAR_HEIGHT, DARK_BLUE, WHITE } from '../../styles';
import { useCustomLandingPages } from './useCustomLandingPages';
import { TopBar } from '../../containers/mobile/HeaderBar/TopBar';

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

const MenuButton = styled(Button)`
  width: 2em;
  height: 2em;
  text-align: right;
  &:hover {
    background-color: inherit;
  }
`;

const MenuIcon = styled(MuiMenuIcon)`
  width: 100%;
  height: 100%;
`;

export const LandingPageMobileNavigation = () => {
  const {
    customLandingPageSettings: {
      primary_hexcode: primaryColor = DARK_BLUE,
      secondary_hexcode: secondaryColor = WHITE,
    },
  } = useCustomLandingPages();

  const openMenu = () => {};

  return (
    <TopBarWrapper secondaryColor={secondaryColor} primaryColor={primaryColor}>
      <TopBar
        currentUserUsername=""
        isUserLoggedIn={false}
        toggleMenuExpanded={openMenu}
        toggleUserMenuExpand={openMenu}
      />
    </TopBarWrapper>
  );
};
