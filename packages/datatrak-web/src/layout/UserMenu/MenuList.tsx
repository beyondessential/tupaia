/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { useMatch } from 'react-router';
import { Link, ListItem } from '@material-ui/core';
import { Button, RouterLink } from '@tupaia/ui-components';
import { useCurrentUser } from '../../api';
import { useLogout } from '../../api/mutations';
import { ROUTES } from '../../constants';
import { CancelConfirmModal } from '../../components';

interface MenuItem {
  label: string;
  to?: string | null;
  href?: string;
  isExternal?: boolean;
  onClick?: (e: any) => void;
  component?: ComponentType<any> | string;
}

const Menu = styled.ul`
  list-style: none;
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
 * The menu list that appears in both the drawer and popover menus. It shows different options depending on whether the
 * user is logged in or not.
 */
export const MenuList = ({
  children,
  onCloseMenu,
}: {
  children?: ReactNode;
  onCloseMenu: () => void;
}) => {
  const [surveyCancelModalIsOpen, setIsOpen] = useState(false);
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const { isLoggedIn, projectId } = useCurrentUser();
  const { mutate: logout } = useLogout();

  const onClickInternalLink = e => {
    if (isSurveyScreen && !isSuccessScreen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const shouldShowCancelModal = isSurveyScreen && !isSuccessScreen;

  const accountSettingsItem = {
    label: 'Account settings',
    onClick: onClickInternalLink,
    to: shouldShowCancelModal ? null : ROUTES.ACCOUNT_SETTINGS,
    component: shouldShowCancelModal ? 'button' : RouterLink,
  };
  // The help centre link is the same for both logged-in and logged-out users
  const helpCentreItem = {
    label: 'Help centre',
    href: 'https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm',
    isExternal: true,
    component: Link,
  };
  const logOutItem = {
    label: 'Log out',
    onClick: () => {
      logout();
      onCloseMenu();
    },
  };

  const hasProjectSelected = !!projectId;

  const getMenuItems = () => {
    const items: MenuItem[] = [];
    if (isLoggedIn && hasProjectSelected) items.push(accountSettingsItem);
    items.push(helpCentreItem);
    if (isLoggedIn) items.push(logOutItem);

    return items;
  };
  const menuItems = getMenuItems();

  return (
    <>
      <Menu>
        {children}
        {menuItems.map(({ label, to, href, isExternal, onClick, component }) => (
          <MenuListItem key={label} button>
            <MenuButton
              component={component || 'button'}
              underline="none"
              target={isExternal ? '_blank' : null}
              onClick={onClick || onCloseMenu}
              to={to}
              href={href}
            >
              {label}
            </MenuButton>
          </MenuListItem>
        ))}
      </Menu>
      <CancelConfirmModal
        isOpen={surveyCancelModalIsOpen}
        onClose={() => setIsOpen(false)}
        confirmLink={ROUTES.ACCOUNT_SETTINGS}
      />
    </>
  );
};
