/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Tabs as MuiTabs, Tab as MuiTab } from '@material-ui/core';
import { useSearchParams } from 'react-router-dom';
import { TABS, TAB_PARAM } from '../../constants';

const TabWrapper = styled(MuiTabs).attrs({
  variant: 'fullWidth',
})`
  .MuiTabs-indicator {
    display: none;
  }
`;

const Tab = styled(MuiTab).attrs({
  disableRipple: true,
})`
  flex: 1;
  color: ${({ theme }) => theme.palette.text.primary};
  background-color: ${({ selected, theme }) =>
    selected ? theme.palette.secondary.main : 'transparent'};
  border: ${({ selected, theme }) =>
    selected ? 'none' : `1px ${theme.palette.secondary.main} solid`};
  text-transform: none;
  opacity: 1;
`;

export const Tabs = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const selectedTab = urlSearchParams.get(TAB_PARAM) || TABS.DASHBOARD;
  const setSelectedTab = (e: ChangeEvent<{}>, value: `${TABS}`) => {
    urlSearchParams.set(TAB_PARAM, value);
    setUrlSearchParams(urlSearchParams);
  };
  return (
    <TabWrapper value={selectedTab} onChange={setSelectedTab}>
      <Tab label="Dashboard" value={TABS.DASHBOARD} />
      <Tab label="Map" value={TABS.MAP} />
    </TabWrapper>
  );
};
