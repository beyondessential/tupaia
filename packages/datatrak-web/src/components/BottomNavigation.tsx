import {
  BottomNavigationAction,
  BottomNavigationProps,
  BottomNavigation as MuiBottomNavigation,
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreHorizRounded';
import React from 'react';
import { Pathname, useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';

import { Description as DescriptionIcon, Home as HomeIcon } from '@tupaia/ui-components';

import { ROUTES } from '../constants';
import { TaskIcon } from './Icons';

type TabValue = 'home' | 'surveys' | 'tasks' | 'more';

const tabRoutes: Record<TabValue, string> = {
  home: ROUTES.HOME,
  surveys: ROUTES.SURVEY_SELECT,
  tasks: ROUTES.TASKS,
  more: ROUTES.MOBILE_USER_MENU,
};

const BottomNavigationRoot = styled(MuiBottomNavigation).attrs({
  component: 'nav',
})`
  border-block-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  height: unset; // MUI hard-codes to 55px and ignores safe area insets

  .MuiBottomNavigationAction-root {
    padding-bottom: max(env(safe-area-inset-bottom, 0), 0.5rem);
    padding-top: 0.5rem;
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

function useBottomNavigationActiveTab(): TabValue | null {
  const { pathname } = useLocation();
  if (pathname.startsWith(ROUTES.SURVEY_SELECT)) return 'surveys';
  if (pathname.startsWith(ROUTES.TASKS)) return 'tasks';
  if (pathname.startsWith(ROUTES.HOME)) return 'home';
  return 'more';
}

export const BottomNavigation = (props: BottomNavigationProps) => {
  const activeTab = useBottomNavigationActiveTab();

  const navigate = useNavigate();
  const onChange = (_event: unknown, newTab: TabValue) => {
    const newRoute = tabRoutes[newTab];
    if (newRoute) navigate(newRoute);
  };

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
