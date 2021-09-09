/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { useIsFetching } from 'react-query';
import { Select } from '@tupaia/ui-components';
import { VitalsView } from './VitalsView';
import { DashboardReportTabView } from './DashboardReportTabView';
import { TabPanel, TabBar, TabBarSection, YearSelector } from '../components';
import { useUrlParams, useUrlSearchParams, useUrlSearchParam } from '../utils';
import { useEntityData } from '../api/queries';
import { DEFAULT_DATA_YEAR } from '../constants';
import { DashboardReportModal } from '../components/DashboardReportModal';
import { ErrorBoundary } from '../components/ErrorBoundary';

const StyledSelect = styled(Select)`
  margin: 0 1rem 0 0;
  width: 14rem;
  text-transform: capitalize;
`;

/**
 * Placeholder template until all the real templates are done
 */
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
  TabBarLeftSection: PropTypes.func.isRequired,
  Body: PropTypes.string.isRequired,
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

const DASHBOARD_CODES = {
  essdpPlan: 'LESMIS_ESSDP_Plan',
  essdpEarlyChildhood: 'LESMIS_ESSDP_EarlyChildhood',
  essdpPrimary: 'LESMIS_ESSDP_Primary',
  essdpLowerSecondary: 'LESMIS_ESSDP_LowerSecondary',
  essdpUpperSecondary: 'LESMIS_ESSDP_UpperSecondary',
  internationalSDGs: 'LESMIS_International_SDGs',
  emergencyInEducation: 'LESMIS_EmergencyInEducation',
};

const makeDropdownOptions = entityType => [
  {
    value: 'profile',
    label: getProfileLabel(entityType),
    TabComponent: DashboardReportTabView,
    useYearSelector: true,
    componentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        !Object.values(DASHBOARD_CODES).some(code => dashboardCode.startsWith(code)), // those not included anywhere else
    },
  },
  {
    value: 'indicators',
    label: 'Free Indicator Selection',
    TabComponent: TabTemplate,
    componentProps: {
      Body: 'Free Indicator Selection',
    },
  },
  {
    value: 'essdpPlan',
    label: 'ESSDP Plan 2021-25 M&E Framework',
    TabComponent: TabTemplate,
    componentProps: {
      Body: '9th Education Sector and Sports Development Plan 2021-25 M&E Framework',
      filterSubDashboards: ({ dashboardCode }) =>
        dashboardCode.startsWith(DASHBOARD_CODES.essdpPlan),
    },
  },
  {
    value: 'essdpEarlyChildhood',
    label: 'ESSDP Early childhood education sub-sector',
    TabComponent: DashboardReportTabView,
    componentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        dashboardCode.startsWith(DASHBOARD_CODES.essdpEarlyChildhood),
    },
  },
  {
    value: 'essdpPrimary',
    label: 'ESSDP Primary sub-sector',
    TabComponent: DashboardReportTabView,
    componentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        dashboardCode.startsWith(DASHBOARD_CODES.essdpPrimary),
    },
  },
  {
    value: 'essdpLowerSecondary',
    label: 'ESSDP Lower secondary sub-sector',
    TabComponent: DashboardReportTabView,
    componentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        dashboardCode.startsWith(DASHBOARD_CODES.essdpLowerSecondary),
    },
  },
  {
    value: 'essdpUpperSecondary',
    label: 'ESSDP Upper secondary sub-sector',
    TabComponent: DashboardReportTabView,
    componentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        dashboardCode.startsWith(DASHBOARD_CODES.essdpUpperSecondary),
    },
  },
  {
    value: 'emergency',
    label: 'Emergency in Education Preparedness and Response',
    TabComponent: DashboardReportTabView,
    componentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        dashboardCode.startsWith(DASHBOARD_CODES.emergencyInEducation),
    },
  },
  {
    value: 'internationalSDGs',
    label: 'International reporting on SDGs',
    TabComponent: DashboardReportTabView,
    componentProps: {
      filterSubDashboards: ({ dashboardCode }) =>
        dashboardCode.startsWith(DASHBOARD_CODES.internationalSDGs),
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
  const isFetching = useIsFetching('dashboardReport');
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  const dropdownOptions = makeDropdownOptions(entityData?.type);
  const [params, setParams] = useUrlSearchParams();
  const [selectedYear, setSelectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);

  const selectedOption = useDefaultDashboardTab(params.dashboard, dropdownOptions);

  const handleDashboardChange = event => {
    setParams({ dashboard: event.target.value, subDashboard: null });
  };

  return (
    <ErrorBoundary>
      <VitalsView entityCode={entityCode} entityType={entityData?.type} />
      {dropdownOptions.map(({ value, TabComponent, useYearSelector, componentProps }) => (
        <TabPanel key={value} isSelected={value === selectedOption} Panel={React.Fragment}>
          <TabComponent
            {...componentProps}
            entityCode={entityCode}
            year={useYearSelector && selectedYear}
            TabBarLeftSection={() => (
              <TabBarSection>
                <StyledSelect
                  id="dashboardtab"
                  options={dropdownOptions}
                  value={selectedOption}
                  onChange={handleDashboardChange}
                  showPlaceholder={false}
                  SelectProps={{
                    MenuProps: { disablePortal: true },
                  }}
                />
                {useYearSelector && (
                  <YearSelector
                    value={selectedYear}
                    onChange={setSelectedYear}
                    isLoading={!!isFetching}
                  />
                )}
              </TabBarSection>
            )}
          />
        </TabPanel>
      ))}
      <DashboardReportModal />
    </ErrorBoundary>
  );
});
