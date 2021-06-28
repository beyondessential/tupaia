/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { Select } from '@tupaia/ui-components';
import { VitalsView } from './VitalsViews';
import { DashboardReportTabView } from './DashboardReportTabView';
import { TabPanel, TabBar, TabBarSection, YearSelector } from '../components';
import { useUrlParams, useUrlSearchParams, useUrlSearchParam } from '../utils';
import { useEntityData } from '../api/queries';
import { DEFAULT_DATA_YEAR } from '../constants';

const StyledSelect = styled(Select)`
  margin: 0 1rem 0 0;
  width: 14rem;
  text-transform: capitalize;
`;

const TabTemplate = ({ TabBarLeftSection, Body }) => (
  <>
    <TabBar>
      <TabBarLeftSection />
    </TabBar>
    <MuiBox p={5} minHeight={500}>
      {Body}
    </MuiBox>
  </>
);

TabTemplate.propTypes = {
  TabBarLeftSection: PropTypes.node.isRequired,
  Body: PropTypes.node.isRequired,
};

const getProfileLabel = entityType => {
  if (!entityType) {
    return 'Profile';
  }
  switch (entityType) {
    case 'district':
      return 'Province Profile';
    case 'sub_district':
      return 'District Profile';
    default:
      return `${entityType} Profile`;
  }
};

const subDashboardFilters = {
  essdpPlan: ({ dashboardCode }) => dashboardCode.startsWith('LESMIS_ESSDP_Plan'),
  essdpEarlyChildhood: ({ dashboardCode }) =>
    dashboardCode.startsWith('LESMIS_ESSDP_EarlyChildhood'),
  essdpPrimary: ({ dashboardCode }) => dashboardCode.startsWith('LESMIS_ESSDP_Primary'),
  essdpLowerSecondary: ({ dashboardCode }) =>
    dashboardCode.startsWith('LESMIS_ESSDP_LowerSecondary'),
  essdpUpperSecondary: ({ dashboardCode }) =>
    dashboardCode.startsWith('LESMIS_ESSDP_UpperSecondary'),
  internationalSDGs: ({ dashboardCode }) => dashboardCode.startsWith('LESMIS_International_SDGs'),
};

const makeDropdownOptions = entityType => [
  {
    value: 'profile',
    label: getProfileLabel(entityType),
    Component: DashboardReportTabView,
    ComponentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        !Object.values(subDashboardFilters).find(filter => filter({ dashboardCode })), // those not included anywhere else
    },
    useYearSelector: true,
  },
  {
    value: 'indicators',
    label: 'Free Indicator Selection',
    Component: TabTemplate,
    Body: 'Free Indicator Selection',
  },
  {
    value: 'essdpPlan',
    label: 'ESSDP Plan 2021-25 M&E Framework',
    Component: TabTemplate,
    Body: '9th Education Sector and Sports Development Plan 2021-25 M&E Framework',
    ComponentProps: {
      filterSubDashboards: subDashboardFilters.essdpPlan,
    },
  },
  {
    value: 'essdpEarlyChildhood',
    label: 'ESSDP Early childhood education sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Early childhood education sub-sector',
    ComponentProps: {
      filterSubDashboards: subDashboardFilters.essdpEarlyChildhood,
    },
  },
  {
    value: 'essdpPrimary',
    label: 'ESSDP Primary sub-sector',
    Component: DashboardReportTabView,
    Body: 'ESSDP Primary sub-sector',
    ComponentProps: {
      filterSubDashboards: subDashboardFilters.essdpPrimary,
    },
  },
  {
    value: 'essdpLowerSecondary',
    label: 'ESSDP Lower secondary sub-sector',
    Component: DashboardReportTabView,
    Body: 'ESSDP Lower secondary sub-sector',
    ComponentProps: {
      filterSubDashboards: subDashboardFilters.essdpLowerSecondary,
    },
  },
  {
    value: 'essdpUpperSecondary',
    label: 'ESSDP Upper secondary sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Upper secondary sub-sector',
    ComponentProps: {
      filterSubDashboards: subDashboardFilters.essdpUpperSecondary,
    },
  },
  {
    value: 'emergency',
    label: 'Emergency in Education/COVID-19',
    Component: TabTemplate,
    Body: 'Emergency in Education/COVID-19',
  },
  {
    value: 'internationalSDGs',
    label: 'International reporting on SDGs',
    Component: DashboardReportTabView,
    Body: 'International reporting on SDGs',
    ComponentProps: {
      filterSubDashboards: subDashboardFilters.internationalSDGs,
    },
  },
];

// Gets the best default dashboard possible, and check if the selected dashboard is valid
const useDefaultDashboardTab = (selectedDashboard = null, options) => {
  if (!options || options.length === 0) {
    return null;
  }

  if (selectedDashboard && options.find(option => option.value === selectedDashboard)) {
    return selectedDashboard;
  }

  return options[0].value;
};

export const DashboardView = React.memo(() => {
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  const dropdownOptions = makeDropdownOptions(entityData?.type);
  const [params, setParams] = useUrlSearchParams();
  const [selectedYear, setSelectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);

  const selectedOption = useDefaultDashboardTab(params.dashboard, dropdownOptions);

  const handleChange = event => {
    setParams({ dashboard: event.target.value, subDashboard: null, year: null });
  };

  return (
    <>
      <VitalsView entityCode={entityCode} entityType={entityData?.type} />
      {dropdownOptions.map(({ value, Body, Component, useYearSelector, ComponentProps }) => (
        <TabPanel key={value} isSelected={value === selectedOption} Panel={React.Fragment}>
          <Component
            entityCode={entityCode}
            year={useYearSelector && selectedYear}
            Body={Body}
            TabBarLeftSection={() => (
              <TabBarSection>
                <StyledSelect
                  id="dashboardtab"
                  options={dropdownOptions}
                  value={selectedOption}
                  onChange={handleChange}
                  showPlaceholder={false}
                  SelectProps={{
                    MenuProps: { disablePortal: true },
                  }}
                />
                {useYearSelector && (
                  <YearSelector value={selectedYear} onChange={setSelectedYear} />
                )}
              </TabBarSection>
            )}
            {...ComponentProps}
          />
        </TabPanel>
      ))}
    </>
  );
});
