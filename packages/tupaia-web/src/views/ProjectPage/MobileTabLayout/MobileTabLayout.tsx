import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Typography, Tabs as MuiTabs, Tab as MuiTab } from '@material-ui/core';
import { TabContext, TabPanel as MuiTabPanel } from '@material-ui/lab';
import { useParams, Outlet } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useEntity } from '../../../api/queries';
import { MOBILE_BREAKPOINT, TABS, URL_SEARCH_PARAMS } from '../../../constants';
import { Map } from '../../../features';
import { Footer } from './Footer';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const EntityName = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  margin: 1.2rem 0;
  text-align: center;
`;

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

const TabPanel = styled(MuiTabPanel)`
  height: 100%;
  padding: 0;
`;

const DashboardPanel = styled(TabPanel)`
  height: auto;
  min-height: 100%;
`;

export const MobileTabLayout = () => {
  const { projectCode, entityCode } = useParams();
  const { data } = useEntity(projectCode, entityCode);

  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const selectedTab = urlSearchParams.get(URL_SEARCH_PARAMS.TAB) || TABS.DASHBOARD;

  const setSelectedTab = (_event: ChangeEvent<{}>, value: `${TABS}`) => {
    urlSearchParams.set(URL_SEARCH_PARAMS.TAB, value);
    setUrlSearchParams(urlSearchParams);
  };

  return (
    <Wrapper>
      <TabContext value={selectedTab}>
        <TabWrapper value={selectedTab} onChange={setSelectedTab}>
          <Tab label="Dashboard" value={TABS.DASHBOARD} />
          <Tab label="Map" value={TABS.MAP} />
        </TabWrapper>
        {data && <EntityName>{data.name}</EntityName>}
        <DashboardPanel value={TABS.DASHBOARD}>
          {/* Ensure the dashboard outlet is not rendered above the Map, otherwise the map will re-mount on route changes */}
          <Outlet />
          <Footer />
        </DashboardPanel>
        <TabPanel value={TABS.MAP}>
          <Map />
        </TabPanel>
      </TabContext>
    </Wrapper>
  );
};
