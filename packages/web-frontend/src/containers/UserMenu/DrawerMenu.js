/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Drawer } from '@material-ui/core';
import { IconButton } from '@tupaia/ui-components';
import CloseIcon from '@material-ui/icons/Close';
import { MenuList } from './MenuList';

/**
 * DrawerMenu is a drawer menu used when the user is on a mobile device
 */

const MenuWrapper = styled.div`
  padding: 0 1.5em;
  li a,
  li button {
    font-size: 1.2em;
    padding: 0.8em;
    line-height: 1.4;
    text-align: left;
    width: 100%;
    font-weight: ${props => props.theme.typography.fontWeightRegular};
    color: inherit;
  }
  a > span {
    text-decoration: underline;
  }
`;

const Username = styled.p`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  text-transform: uppercase;
  margin: 0;
  width: 100%;
  padding: 0 1em;
`;

const MenuHeaderWrapper = styled.div`
  padding: 0;
`;

const MenuHeaderContainer = styled.div`
  border-bottom: 1px solid ${({ secondaryColor }) => secondaryColor};
  display: flex;
  justify-content: flex-end;
  padding: 0.8em 0;
  align-items: center;
`;

const MenuCloseIcon = styled(CloseIcon)`
  width: 1.2em;
  height: 1.2em;
  fill: ${({ secondaryColor }) => secondaryColor};
`;

const MenuCloseButton = styled(IconButton)`
  padding: 0;
`;

export const DrawerMenu = ({
  menuItems: baseMenuItems,
  menuOpen,
  onCloseMenu,
  primaryColor,
  secondaryColor,
  onClickSignIn,
  onClickRegister,
  signInText,
  isUserLoggedIn,
  currentUserUsername,
}) => {
  // if logged in, show the base menu items, else add also a login and register button
  const menuItems = isUserLoggedIn
    ? baseMenuItems
    : [
        {
          actionText: signInText,
          action: onClickSignIn,
        },
        {
          actionText: 'Register',
          action: onClickRegister,
        },
        ...baseMenuItems,
      ];
  return (
    <Drawer
      anchor="right"
      open={menuOpen}
      onClose={onCloseMenu}
      PaperProps={{ style: { backgroundColor: primaryColor, minWidth: '70vw' } }}
    >
      <MenuWrapper>
        <MenuHeaderWrapper>
          <MenuHeaderContainer secondaryColor={secondaryColor}>
            {currentUserUsername && <Username>{currentUserUsername}</Username>}
            <MenuCloseButton onClick={onCloseMenu} aria-label="Close menu">
              <MenuCloseIcon secondaryColor={secondaryColor} />
            </MenuCloseButton>
          </MenuHeaderContainer>
        </MenuHeaderWrapper>
        <MenuList menuItems={menuItems} closeMenu={onCloseMenu} />
      </MenuWrapper>
    </Drawer>
  );
};

DrawerMenu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      actionText: PropTypes.string,
      action: PropTypes.func,
      preText: PropTypes.string,
      type: PropTypes.oneOf(['link', 'button']),
    }),
  ).isRequired,
  menuOpen: PropTypes.bool.isRequired,
  onCloseMenu: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
  secondaryColor: PropTypes.string.isRequired,
};
