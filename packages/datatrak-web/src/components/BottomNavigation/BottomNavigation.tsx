import {
  BottomNavigationAction,
  BottomNavigationProps,
  BottomNavigation as MuiBottomNavigation,
} from '@material-ui/core';
import {
  House as HomeIcon,
  Ellipsis as MoreIcon,
  ClipboardList as SurveysIcon,
  ListChecks as TasksIcon,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { BOTTOM_NAVIGATION_HEIGHT_SMALL, ROUTES } from '../../constants';
import { useBottomNavigationActiveTab } from './useBottomNavigationActiveTab';

export type TabValue = 'home' | 'surveys' | 'tasks' | 'more';

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
  min-height: ${BOTTOM_NAVIGATION_HEIGHT_SMALL};

  .MuiBottomNavigationAction-root {
    padding-bottom: max(env(safe-area-inset-bottom, 0), 0.5rem);
    padding-top: 0.5rem;
  }

  .MuiBottomNavigationAction-wrapper {
    row-gap: 0.125rem;
  }

  .MuiBottomNavigationAction-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.02em;

    &.Mui-selected {
      color: ${props => props.theme.palette.text.primary};
    }
  }
`;

export const BottomNavigation = (props: BottomNavigationProps) => {
  const activeTab = useBottomNavigationActiveTab();

  const navigate = useNavigate();
  const onChange = (_event: unknown, newTab: TabValue) => {
    const newRoute = tabRoutes[newTab];
    if (newRoute) navigate(newRoute);
  };

  return (
    <BottomNavigationRoot onChange={onChange} showLabels value={activeTab} {...props}>
      <BottomNavigationAction icon={<HomeIcon />} label="Home" value="home" />
      <BottomNavigationAction icon={<SurveysIcon />} label="Surveys" value="surveys" />
      <BottomNavigationAction icon={<TasksIcon />} label="Tasks" value="tasks" />
      <BottomNavigationAction icon={<MoreIcon />} label="More" value="more" />
    </BottomNavigationRoot>
  );
};
