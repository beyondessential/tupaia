import { Link, ListItem } from '@material-ui/core';
import LaunchIcon from '@material-ui/icons/Launch';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { ComponentType, ReactNode, useState } from 'react';
import { useMatch } from 'react-router';
import styled from 'styled-components';

import { Button, RouterLink } from '@tupaia/ui-components';

import { useCurrentUserContext, useLogout } from '../../api';
import { CancelConfirmModal } from '../../components';
import { ArrowRightIcon } from '../../components/Icons/ArrowLeftIcon';
import { ROUTES } from '../../constants';
import { MobileUserMenuRoot } from './MobileUserMenu';

interface MenuItem {
  label: string;
  to?: string | null;
  href?: string;
  isExternal?: boolean;
  onClick?: (e: Event) => void;
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

const MenuListItem = styled(ListItem)`
  padding: 0;

  ${MobileUserMenuRoot} & {
    border-block-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  }
  ${MobileUserMenuRoot} & + & {
    margin-block-start: 1em;
  }
`;

export const MenuButton = styled(Button).attrs({
  variant: 'text',
  color: 'default',
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
  ${MobileUserMenuRoot} & .MuiButton-endIcon {
    display: flex;
    margin-inline-start: auto;
  }
`;

const chevronRight = <ArrowRightIcon />;
const externalIcon = <LaunchIcon />;
const logoutIcon = <LogoutIcon />;

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
  const [confirmModalLink, setConfirmModalLink] = useState('');
  const { isLoggedIn, projectId, hasAdminPanelAccess } = useCurrentUserContext();
  const hasProjectSelected = !!projectId;
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
      onCloseMenu?.();
    }
  };

  const allItems: MenuItem[] = [
    {
      label: 'Account settings',
      component: shouldShowCancelModal ? 'button' : RouterLink,
      onClick: e => onClickInternalLink(e, ROUTES.ACCOUNT_SETTINGS),
      to: shouldShowCancelModal ? null : ROUTES.ACCOUNT_SETTINGS,
      hidden: !isLoggedIn || !hasProjectSelected,
      icon: chevronRight,
    },
    {
      label: 'Reports',
      component: shouldShowCancelModal ? 'button' : RouterLink,
      onClick: e => onClickInternalLink(e, ROUTES.REPORTS),
      to: shouldShowCancelModal ? null : ROUTES.REPORTS,
      hidden: !isLoggedIn || !hasAdminPanelAccess,
      icon: chevronRight,
    },
    {
      label: 'Help centre',
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
      onClick: () => {
        logout();
        onCloseMenu?.();
      },
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
          .map(({ label, to, href, isExternal, onClick, component, icon }) => (
            <MenuListItem key={label} button>
              <MenuButton
                component={component || 'button'}
                endIcon={icon}
                underline="none"
                rel={isExternal ? 'external' : null}
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
        confirmPath={confirmModalLink}
      />
    </>
  );
};
