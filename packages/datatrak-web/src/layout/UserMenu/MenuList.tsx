import { Link, ListItem, Typography } from '@material-ui/core';
import { ChevronRight, LogOut, SquareArrowOutUpRight } from 'lucide-react';
import React, { type ComponentType, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '@tupaia/constants';
import { Button } from '@tupaia/ui-components';
import { useCurrentUserContext } from '../../api';
import { useIsOfflineFirst } from '../../api/offlineFirst';
import { type RoutePath, ROUTES } from '../../constants';
import { MobileUserMenuRoot } from './MobileUserMenu';

interface MenuItem {
  label: string;
  href?: string;
  isExternal?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  component?: ComponentType<any> | string;
  hidden?: boolean;
  icon?: React.ReactNode;
}

const Menu = styled.ul.attrs({ role: 'list' })`
  margin-block: 0.5rem;
  margin-inline: auto;
  max-inline-size: 30rem;

  ${MobileUserMenuRoot} & {
    margin-block: 2rem;
  }
`;

const MenuListItem = styled(ListItem).attrs({ component: 'li' })`
  padding: 0;

  ${MobileUserMenuRoot} & {
    border-block-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  }
  ${MobileUserMenuRoot} & + & {
    margin-block-start: 1em;
  }
`;

export const MenuButton = styled(Button).attrs({
  color: 'default',
  size: 'large',
  variant: 'text',
})`
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  inline-size: 100%;
  justify-content: flex-start;
  margin: 0;
  padding-block: 0.8rem;
  padding-inline: 0.5rem;

  &,
  .MuiButton-label {
    font-size: inherit;
  }

  .MuiButton-endIcon {
    color: ${props => props.theme.palette.text.secondary};
    display: none;
  }

  ${MobileUserMenuRoot} & {
    padding-inline: 0;

    .MuiSvgIcon-root {
      font-size: 1.5rem;
    }

    .MuiButton-endIcon {
      display: flex;
      margin-inline-start: auto;
      margin-inline-end: unset;
    }
  }
`;

const chevronRight = <ChevronRight />;
const externalIcon = <SquareArrowOutUpRight />;
const logoutIcon = <LogOut />;

const AppVersionParagraph = styled(Typography).attrs({
  component: 'footer',
  color: 'textSecondary',
  variant: 'body2',
})`
  font-variant-numeric: lining-nums slashed-zero tabular-nums;

  /* Desktop-only styles */
  margin-block: 0.8rem;
  padding-inline: 0.5rem;
  ${MobileUserMenuRoot} & {
    /* Unset desktop styles defined immediately above */
    margin-block-end: unset;
    padding-inline: unset;
    /* Define mobile-only styles */
    margin-block-start: 1rem;
    padding-block-start: 0.8rem;
  }
`;

const appVersionText = process.env.REACT_APP_VERSION ? (
  <AppVersionParagraph>{`Tupaia DataTrak v${process.env.REACT_APP_VERSION}`}</AppVersionParagraph>
) : null;

/**
 * The menu list that appears in both the drawer and popover menus. It shows different options depending on whether the
 * user is logged in or not.
 */
export const MenuList = ({
  children,
  onCloseMenu,
}: {
  children?: ReactNode;
  onCloseMenu?: () => void;
}) => {
  const { isLoggedIn, projectId, accessPolicy } = useCurrentUserContext();
  const hasAdminPanelAccess =
    accessPolicy?.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP) ?? false;
  const hasProjectSelected = !!projectId;
  const isOfflineFirst = useIsOfflineFirst();
  const navigate = useNavigate();

  const handleNavigate = (path: RoutePath) => {
    navigate(path);
    onCloseMenu?.();
  };

  const allItems: MenuItem[] = [
    {
      label: 'Account settings',
      onClick: () => handleNavigate(ROUTES.ACCOUNT_SETTINGS),
      hidden: !isLoggedIn || !hasProjectSelected,
      icon: chevronRight,
    },
    {
      label: 'Reports',
      onClick: () => handleNavigate(ROUTES.REPORTS),
      hidden: !isLoggedIn || !hasAdminPanelAccess,
      icon: chevronRight,
    },
    {
      label: 'Support centre',
      component: Link,
      href: 'https://bes-support.zendesk.com',
      isExternal: true,
      icon: externalIcon,
    },
    {
      label: 'Visit Tupaia.org',
      component: Link,
      href: process.env.REACT_APP_TUPAIA_REDIRECT_URL || 'https://tupaia.org',
      isExternal: true,
      icon: externalIcon,
    },
    {
      label: 'Log out',
      // Navigate to the /logout route rather than calling the logout API
      // directly, so the survey navigation blocker can intercept and confirm
      // before any auth state is cleared.
      onClick: () => handleNavigate(ROUTES.LOGOUT),
      hidden: !isLoggedIn,
      icon: logoutIcon,
    },
  ];

  return (
    <>
      <Menu>
        {children}
        {allItems
          .filter(item => !item.hidden)
          .map(({ label, href, isExternal, onClick, component, icon }) => (
            <MenuListItem key={label} button>
              <MenuButton
                component={component || 'button'}
                endIcon={icon}
                underline="none"
                rel={isExternal ? 'external' : null}
                target={isExternal ? '_blank' : null}
                onClick={onClick ?? onCloseMenu}
                href={href}
              >
                {label}
              </MenuButton>
            </MenuListItem>
          ))}
        {isOfflineFirst && appVersionText}
      </Menu>
    </>
  );
};
