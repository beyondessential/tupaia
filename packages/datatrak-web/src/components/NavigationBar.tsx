import { BottomNavigation, BottomNavigationAction, BottomNavigationProps } from '@material-ui/core';
import SurveyIcon from '@material-ui/icons/DescriptionRounded';
import DashboardIcon from '@material-ui/icons/HomeRounded';
import MoreIcon from '@material-ui/icons/MoreHorizRounded';
import React, { useState } from 'react';
import { matchPath, useLocation } from 'react-router';
import styled from 'styled-components';

import { ROUTES } from '../constants';
import { TaskIcon } from './Icons';

type TabValue = 'home' | 'surveys' | 'tasks' | 'more';

/**
 * @privateRemarks The magic numbers/absolute values match that of the underlying elements from MUI.
 * We simply want to expand them out into the “unsafe” area. We apply the extended padding to the
 * buttons (instead of this root element) to give the user a larger tap target.
 */
const NavigationBarRoot = styled.div`
  .MuiBottomNavigationAction-root {
    padding-bottom: calc(env(safe-area-inset-bottom, 0) + 8px);

    &:first-child {
      padding-left: calc(env(safe-area-inset-left, 0) + 12px);
    }
    &:last-child {
      padding-right: calc(env(safe-area-inset-right, 0) + 12px);
    }
  }
`;

export const NavigationBar = (props: BottomNavigationProps) => {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<TabValue | null>(() => {
    if (matchPath(ROUTES.HOME, pathname)) return 'home';
    if (matchPath(`${ROUTES.SURVEY_SELECT}/* `, pathname)) return 'surveys';
    if (matchPath(`${ROUTES.TASKS}/*`, pathname)) return 'tasks';

    return null;
  });
  const onChange = (_event: unknown, value: TabValue) => {
    setActiveTab(value);
  };

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
