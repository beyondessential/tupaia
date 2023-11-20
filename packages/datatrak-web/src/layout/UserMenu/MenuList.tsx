/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { Link, ListItem } from '@material-ui/core';
import { Button, RouterLink } from '@tupaia/ui-components';
import { useCurrentUser } from '../../api';
import { useLogout } from '../../api/mutations';
import { ROUTES } from '../../constants';

const Menu = styled.ul`
  list-style: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
  margin: 0.5rem 0;
`;

const MenuListItem = styled(ListItem)`
  padding: 0;
`;

export const MenuButton = styled(Button).attrs({
  variant: 'text',
  color: 'default',
})`
  width: 100%;
  justify-content: flex-start;
  padding: 0.8rem 0.5rem;
  font-size: 1rem;
  margin: 0;
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  & ~ .MuiButtonBase-root {
    margin-left: 0;
  }
`;

/**
 * This is the menu list that appears in both the drawer and popover menus. It shows different options depending on whether the user is logged in or not.
 */
export const MenuList = ({
  children,
  onCloseMenu,
}: {
  children?: ReactNode;
  onCloseMenu: () => void;
}) => {
  const { isLoggedIn } = useCurrentUser();
  const { mutate: logout } = useLogout();

  // The help centre link is the same for both logged in and logged out users
  const helpCentre = {
    label: 'Help centre',
    href: 'https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm',
    isExternal: true,
    component: Link,
  };
  const onClickLogout = () => {
    logout();
    onCloseMenu();
  };

  const menuItems = isLoggedIn
    ? [
        {
          label: 'Account settings',
          to: ROUTES.ACCOUNT_SETTINGS,
        },
        helpCentre,
        {
          label: 'Logout',
          onClick: onClickLogout,
          component: 'button',
        },
      ]
    : [helpCentre];

  return (
    <Menu>
      {children}
      {menuItems.map(
        ({
          label,
          to,
          href,
          isExternal,
          onClick,
          component,
        }: {
          label: string;
          to?: string;
          href?: string;
          isExternal?: boolean;
          onClick?: () => void;
          component?: ComponentType<any> | string;
        }) => (
          <MenuListItem key={label} button>
            <MenuButton
              component={component || RouterLink}
              underline="none"
              target={isExternal ? '_blank' : null}
              onClick={onClick || onCloseMenu}
              to={to}
              href={href}
            >
              {label}
            </MenuButton>
          </MenuListItem>
        ),
      )}
    </Menu>
  );
};
