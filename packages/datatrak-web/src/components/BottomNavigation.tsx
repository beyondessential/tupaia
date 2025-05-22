import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  BottomNavigationProps,
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreHorizRounded';
import React, { useEffect, useState } from 'react';
import { Pathname, matchPath, useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';

import { Home as HomeIcon, Description as DescriptionIcon } from '@tupaia/ui-components';

import { ROUTES } from '../constants';
import { TaskIcon } from './Icons';

type TabValue = 'home' | 'surveys' | 'tasks' | 'more';

const BottomNavigationRoot = styled(MuiBottomNavigation).attrs({
  component: 'nav',
})`
  border-block-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  height: unset; // MUI hard-codes to 55px and ignores safe area insets

  .MuiBottomNavigationAction-root {
    --padding-y: 0.5rem;
    padding-bottom: max(env(safe-area-inset-bottom, 0), var(--padding-y));
    padding-top: var(--padding-y);
  }

  .MuiBottomNavigationAction-wrapper {
    row-gap: 0.125rem;
  }

  .MuiBottomNavigationAction-label {
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.02em;

    &.Mui-selected {
      color: ${props => props.theme.palette.text.primary};
      font-weight: 500;
    }
  }
`;

function getTabFromPathname(pathname: Pathname): TabValue | null {
  if (matchPath(`${ROUTES.SURVEY_SELECT}/*`, pathname)) return 'surveys';
  if (matchPath(`${ROUTES.TASKS}/*`, pathname)) return 'tasks';
  if (matchPath(ROUTES.HOME, pathname)) return 'home';
  return 'more';
}

export const BottomNavigation = (props: BottomNavigationProps) => {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<TabValue | null>(getTabFromPathname(pathname));

  const navigate = useNavigate();
  const onChange = (_event: unknown, value: TabValue) => {
    switch (value) {
      case 'home':
        navigate(ROUTES.HOME);
        break;
      case 'surveys':
        navigate(ROUTES.SURVEY_SELECT);
        break;
      case 'tasks':
        navigate(ROUTES.TASKS);
        break;
      case 'more':
        navigate(ROUTES.MOBILE_USER_MENU);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const newTab = getTabFromPathname(pathname);
    setActiveTab(newTab);
  }, [pathname]);

  useEffect(() => {
    return () => setActiveTab(null);
  }, []);

  return (
    <BottomNavigationRoot onChange={onChange} showLabels value={activeTab} {...props}>
      <BottomNavigationAction
        icon={<HomeIcon variant={activeTab === 'home' ? 'filled' : 'outlined'} />}
        label="Home"
        value="home"
      />
      <BottomNavigationAction
        icon={<DescriptionIcon variant={activeTab === 'surveys' ? 'filled' : 'outlined'} />}
        label="Surveys"
        value="surveys"
      />
      <BottomNavigationAction
        icon={<TaskIcon variant={activeTab === 'tasks' ? 'filled' : 'outlined'} />}
        label="Tasks"
        value="tasks"
      />
      <BottomNavigationAction icon={<MoreIcon />} label="More" value="more" />
    </BottomNavigationRoot>
  );
};
