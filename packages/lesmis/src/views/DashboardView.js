/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import { Tabs, Tab, TabPanel } from '../components';
import { useUrlParams } from '../utils';
import { DEFAULT_DASHBOARD_GROUP } from '../constants';
import { DashboardReportTabView } from './DashboardReportTabView';
import * as COLORS from '../constants';
import { useEntityData } from '../api/queries';

const TemplateBody = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 1rem;
  min-height: 300px;
`;

const YEARS = ['2015', '2016', '2017', '2018', '2019', '2020', '2021'];

const EarlyChildhoodTab = () => (
  <MuiBox p={5} minHeight={500}>
    ESSDP Early Childhood Education Tab
  </MuiBox>
);

const PrimaryTab = () => (
  <MuiBox p={5} minHeight={500}>
    ESSDP Primary Tab
  </MuiBox>
);

const TABS = [
  {
    key: 'profile',
    getLabel: entityType => (entityType ? `${entityType} Profile` : 'Profile'),
    Component: DashboardReportTabView,
  },
  {
    key: 'earlyChildhood',
    getLabel: () => 'ESSDP Early Childhood Education',
    Component: EarlyChildhoodTab,
  },
  { key: 'primary', getLabel: () => 'ESSDP Primary', Component: PrimaryTab },
];

export const DashboardView = () => {
  const { entityCode } = useUrlParams();
  const [selectedTab, setSelectedTab] = useState(TABS[0].key);
  const [selectedDashboard, setSelectedDashboard] = useState(DEFAULT_DASHBOARD_GROUP);
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);
  const { data: entityData } = useEntityData(entityCode);

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <TemplateBody>
        <MuiContainer>
          <Typography>Dashboard View</Typography>
        </MuiContainer>
      </TemplateBody>
      <Tabs value={selectedTab} onChange={handleChangeTab}>
        {TABS.map(({ getLabel, key }) => (
          <Tab key={key} label={getLabel(entityData?.type)} value={key} />
        ))}
      </Tabs>
      {TABS.map(({ key, Component }) => (
        <TabPanel key={key} isSelected={key === selectedTab} Panel={React.Fragment}>
          <Component
            entityCode={entityCode}
            selectedDashboard={selectedDashboard}
            setSelectedDashboard={setSelectedDashboard}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        </TabPanel>
      ))}
    </>
  );
};
