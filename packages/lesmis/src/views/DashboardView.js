/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import { Select } from '@tupaia/ui-components';
import { TabPanel, TabBar, TabBarSection } from '../components';
import { useUrlParams } from '../utils';
import { DashboardReportTabView } from './DashboardReportTabView';
import * as COLORS from '../constants';
import { useEntityData } from '../api/queries';

const TemplateBody = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 1rem;
  min-height: 300px;
`;

const StyledSelect = styled(Select)`
  margin: 0 1rem 0 0;
  width: 14rem;
  text-transform: capitalize;
`;

const TabTemplate = ({ TabSelector, Body }) => (
  <>
    <TabBar>
      <TabBarSection>{TabSelector}</TabBarSection>
    </TabBar>
    <MuiBox p={5} minHeight={500}>
      {Body}
    </MuiBox>
  </>
);

TabTemplate.propTypes = {
  TabSelector: PropTypes.node.isRequired,
  Body: PropTypes.node.isRequired,
};

const makeTabOptions = entityType => [
  {
    value: 'profile',
    label: entityType ? `${entityType} Profile` : 'Profile',
    Component: DashboardReportTabView,
  },
  {
    value: 'essdpPlan',
    label: 'ESSDP Plan 2021-25 M&E Framework',
    Component: TabTemplate,
    Body: '9th Education Sector and Sports Development Plan 2021-25 M&E Framework',
  },
  {
    value: 'earlyChildhood',
    label: 'ESSDP Early childhood education sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Early childhood education sub-sector',
  },
  {
    value: 'primary',
    label: 'ESSDP Primary sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Primary sub-sector',
  },
  {
    value: 'secondary',
    label: 'ESSDP Lower secondary sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Lower secondary sub-sector',
  },
  {
    value: 'emergency',
    label: 'Emergency in Education/COVID-19',
    Component: TabTemplate,
    Body: 'Emergency in Education/COVID-19',
  },
  {
    value: 'international',
    label: 'International reporting on SDGs',
    Component: TabTemplate,
    Body: 'International reporting on SDGs',
  },
];

export const DashboardView = () => {
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);

  const tabOptions = makeTabOptions(entityData?.type);

  const [selectedTab, setSelectedTab] = useState(tabOptions[0].value);

  const handleChangeTab = event => {
    setSelectedTab(event.target.value);
  };

  return (
    <>
      <TemplateBody>
        <MuiContainer>
          <Typography>Dashboard View</Typography>
        </MuiContainer>
      </TemplateBody>
      {tabOptions.map(({ value, Body, Component }) => (
        <TabPanel key={value} isSelected={value === selectedTab} Panel={React.Fragment}>
          <Component
            entityCode={entityCode}
            Body={Body}
            TabSelector={
              <StyledSelect
                id="dashboardtab"
                options={tabOptions}
                value={selectedTab}
                onChange={handleChangeTab}
                showPlaceholder={false}
                SelectProps={{
                  MenuProps: { disablePortal: true },
                }}
              />
            }
          />
        </TabPanel>
      ))}
    </>
  );
};
