/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { Link, ListItem } from '@material-ui/core';
import { Button, RouterLink } from '@tupaia/ui-components';
import { useUser } from '../../api/queries';
import { useLogout } from '../../api/mutations';

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

export const MenuList = ({ children }: { children?: ReactNode }) => {
  const { isLoggedIn } = useUser();
  const { mutate: logout } = useLogout();

  const helpCentre = {
    label: 'Help centre',
    href: 'https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm',
    isExternal: true,
    component: Link,
  };

  const menuItems = isLoggedIn
    ? [
        {
          label: 'Change project',
          to: '/change-project',
        },
        {
          label: 'Account settings',
          to: '/account-settings',
        },
        helpCentre,
        {
          label: 'Logout',
          onClick: logout,
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
              target={isExternal ? '_blank' : null}
              onClick={onClick}
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
