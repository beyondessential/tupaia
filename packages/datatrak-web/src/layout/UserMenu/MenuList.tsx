import React, { ComponentType, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { useMatch } from 'react-router';
import { Link, ListItem } from '@material-ui/core';
import { Button, RouterLink } from '@tupaia/ui-components';
import { useCurrentUserContext, useLogout } from '../../api';
import { ROUTES } from '../../constants';
import { CancelConfirmModal } from '../../components';

interface MenuItem {
  label: string;
  to?: string | null;
  href?: string;
  isExternal?: boolean;
  onClick?: (e: Event) => void;
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
  const [confirmModalLink, setConfirmModalLink] = useState('');
  const { isLoggedIn, projectId, hasAdminPanelAccess } = useCurrentUserContext();
  const [surveyCancelModalIsOpen, setIsOpen] = useState(false);
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const { mutate: logout } = useLogout();

  const shouldShowCancelModal = isSurveyScreen && !isSuccessScreen;

  const onClickInternalLink = (e: any, confirmLink: string) => {
    if (shouldShowCancelModal) {
      e.preventDefault();
      setIsOpen(true);
      setConfirmModalLink(confirmLink);
    } else {
      onCloseMenu();
    }
  };

  const reportsItem = {
    label: 'Reports',
    onClick: e => onClickInternalLink(e, ROUTES.REPORTS),
    to: shouldShowCancelModal ? null : ROUTES.REPORTS,
    component: shouldShowCancelModal ? 'button' : RouterLink,
  };

  const accountSettingsItem = {
    label: 'Account settings',
    onClick: e => onClickInternalLink(e, ROUTES.ACCOUNT_SETTINGS),
    to: shouldShowCancelModal ? null : ROUTES.ACCOUNT_SETTINGS,
    component: shouldShowCancelModal ? 'button' : RouterLink,
  };
  const supportCentreItem = {
    label: 'Support centre',
    href: 'https://bes-support.zendesk.com',
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

  const getLoggedInMenuItems = () => {
    const items: MenuItem[] = [];
    if (isLoggedIn && hasProjectSelected) items.push(accountSettingsItem);
    if (hasAdminPanelAccess) items.push(reportsItem);
    return [...items, supportCentreItem, logOutItem];
  };
  const getMenuItems = () => {
    if (isLoggedIn) return getLoggedInMenuItems();

    return [supportCentreItem];
  };
  const menuItems = getMenuItems() as MenuItem[];

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
        confirmLink={confirmModalLink}
      />
    </>
  );
};
