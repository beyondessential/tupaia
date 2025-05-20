import { BottomNavigation, BottomNavigationAction, BottomNavigationProps } from '@material-ui/core';
import SurveyIcon from '@material-ui/icons/DescriptionRounded';
import DashboardIcon from '@material-ui/icons/HomeRounded';
import MoreIcon from '@material-ui/icons/MoreHorizRounded';
import React, { useEffect, useState } from 'react';
import { Pathname, matchPath, useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';

import { ROUTES } from '../constants';
import { TaskIcon } from './Icons';

type TabValue = 'home' | 'surveys' | 'tasks' | 'more';

const NavigationBarRoot = styled.nav`
  border-block-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  height: unset; // MUI hard-codes to 55px

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
      font-weight: 500;
    }
  }
`;

function getTabFromPathname(pathname: Pathname): TabValue | null {
  if (matchPath(`${ROUTES.SURVEY_SELECT}/*`, pathname)) return 'surveys';
  if (matchPath(`${ROUTES.TASKS}/*`, pathname)) return 'tasks';
  if (matchPath(ROUTES.HOME, pathname)) return 'home';
  if (matchPath(ROUTES.MOBILE_MORE_MENU, pathname)) return 'more';
  return null;
}

export const NavigationBar = (props: BottomNavigationProps) => {
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
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const newTab = getTabFromPathname(pathname);
    if (newTab !== activeTab) setActiveTab(newTab);
  }, [activeTab, pathname]);

  useEffect(() => {
    return () => setActiveTab(null);
  }, []);

  return (
    <BottomNavigation
      component={NavigationBarRoot}
      onChange={onChange}
      showLabels
      value={activeTab}
      {...props}
    >
      <BottomNavigationAction icon={<DashboardIcon />} label="Home" value="home" />
      <BottomNavigationAction icon={<SurveyIcon />} label="Surveys" value="surveys" />
      <BottomNavigationAction icon={<TaskIcon />} label="Tasks" value="tasks" />
      <BottomNavigationAction icon={<MoreIcon />} label="More" value="more" />
    </BottomNavigation>
  );
};
