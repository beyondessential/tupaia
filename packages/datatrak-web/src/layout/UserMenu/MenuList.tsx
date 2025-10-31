import { Link, ListItem } from '@material-ui/core';
import { ChevronRight, LogOut, SquareArrowOutUpRight } from 'lucide-react';
import React, { ComponentType, ReactNode, useState } from 'react';
import { useMatch } from 'react-router';
import styled from 'styled-components';

import { Button, RouterLink } from '@tupaia/ui-components';
import { getModelsForPush } from '@tupaia/sync';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '@tupaia/constants';

import { useCurrentUserContext, useLogout } from '../../api';
import { CancelConfirmModal } from '../../components';
import { ROUTES } from '../../constants';
import { MobileUserMenuRoot } from './MobileUserMenu';
import { useDatabaseContext } from '../../hooks/database';
import { countOutgoingChanges } from '../../sync/countOutgoingChanges';
import { useIsOfflineFirst } from '../../api/offlineFirst';

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
  const { isLoggedIn, projectId, accessPolicy } = useCurrentUserContext();
  const hasAdminPanelAccess =
    accessPolicy?.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP) ?? false;
  const hasProjectSelected = !!projectId;
  const [surveyCancelModalIsOpen, setIsOpen] = useState(false);
  const [unsyncedChangesWarningModalOpen, setUnsyncedChangesWarningModalOpen] = useState(false);
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const isOfflineFirst = useIsOfflineFirst();
  const { mutate: logout } = useLogout();
  const { models } = useDatabaseContext() || {};

  const shouldShowCancelModal = isSurveyScreen && !isSuccessScreen;

  const handleLogout = async () => {
    logout();
    setUnsyncedChangesWarningModalOpen(false);
    onCloseMenu?.();
  };

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
      onClick: async () => {
        if (isOfflineFirst && models) {
          const unsyncedChangesCount = await countOutgoingChanges(
            getModelsForPush(models.getModels()),
            models.tombstone,
            models.localSystemFact,
          );

          if (unsyncedChangesCount > 0) {
            setUnsyncedChangesWarningModalOpen(true);
          } else {
            handleLogout();
          }
        } else {
          handleLogout();
        }
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
        headingText="Unsynced data"
        bodyText="You are about to log out with unsynced data! Go back to your home page and sync using the top right sync button and sync before logging out"
        confirmText="Log out anyway"
        cancelText="Cancel"
        isOpen={unsyncedChangesWarningModalOpen}
        onClose={() => setUnsyncedChangesWarningModalOpen(false)}
        onConfirm={handleLogout}
      />
      <CancelConfirmModal
        isOpen={surveyCancelModalIsOpen}
        onClose={() => setIsOpen(false)}
        confirmPath={confirmModalLink}
      />
    </>
  );
};
