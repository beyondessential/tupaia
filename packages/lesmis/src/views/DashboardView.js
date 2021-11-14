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
import { useUrlParams, useUrlSearchParams, useUrlSearchParam, useI18n } from '../utils';
import { useEntityData } from '../api/queries';
import { DEFAULT_DATA_YEAR, SUB_DASHBOARD_OPTIONS } from '../constants';
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
    <MuiBox p={5} minHeight={600}>
      {Body}
    </MuiBox>
  </>
);

TabTemplate.propTypes = {
  TabBarLeftSection: PropTypes.func.isRequired,
  Body: PropTypes.string.isRequired,
};

const useDashboardDropdownOptions = () => {
  const { entityCode } = useUrlParams();
  const { getProfileLabel, translate } = useI18n();
  const { data: entityData } = useEntityData(entityCode);
  const [params] = useUrlSearchParams();
  const selectedDashboard = params.dashboard;

  const dropdownOptions = [
    {
      value: 'profile',
      label: getProfileLabel(entityData?.type),
      TabComponent: DashboardReportTabView,
      useYearSelector: true,
      componentProps: {
        // those not included anywhere else
        filterSubDashboards: ({ dashboardCode }) =>
          !Object.values(SUB_DASHBOARD_OPTIONS).some(({ code }) =>
            dashboardCode.startsWith(`LESMIS_${code}`),
          ),
      },
    },
    {
      value: 'indicators',
      label: translate('dashboards.freeIndicatorSelection'),
      TabComponent: TabTemplate,
      componentProps: {
        Body: 'Free Indicator Selection',
      },
    },
    {
      value: 'ESSDP_Plan',
      label: translate('dashboards.essdpPlan202125M&eFramework'),
      TabComponent: TabTemplate,
      componentProps: {
        Body: '9th Education Sector and Sports Development Plan 2021-25 M&E Framework',
        filterSubDashboards: ({ dashboardCode }) => dashboardCode.startsWith('LESMIS_ESSDP_Plan'),
      },
    },
    ...SUB_DASHBOARD_OPTIONS.map(dashboard => ({
      value: dashboard.code,
      label: translate(dashboard.label),
      TabComponent: DashboardReportTabView,
      componentProps: {
        filterSubDashboards: ({ dashboardCode }) =>
          dashboardCode.startsWith(`LESMIS_${dashboard.code}`),
      },
    })),
  ];

  const selectedOption =
    selectedDashboard && dropdownOptions.find(option => option.value === selectedDashboard);

  return {
    dropdownOptions,
    selectedOption: selectedOption || dropdownOptions[0],
  };
};

export const DashboardView = React.memo(() => {
  const isFetching = useIsFetching('dashboardReport');
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  // eslint-disable-next-line no-unused-vars
  const [params, setParams] = useUrlSearchParams();
  const [selectedYear, setSelectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);

  const { dropdownOptions, selectedOption } = useDashboardDropdownOptions();

  const handleDashboardChange = event => {
    setParams({ dashboard: event.target.value, subDashboard: null });
  };

  return (
    <ErrorBoundary>
      <VitalsView entityCode={entityCode} entityType={entityData?.type} />
      {dropdownOptions.map(({ value, TabComponent, useYearSelector, componentProps }) => (
        <TabPanel key={value} isSelected={value === selectedOption.value} Panel={React.Fragment}>
          <TabComponent
            {...componentProps}
            entityCode={entityCode}
            year={useYearSelector && selectedYear}
            TabBarLeftSection={() => (
              <TabBarSection>
                <StyledSelect
                  id="dashboardtab"
                  options={dropdownOptions}
                  value={selectedOption.value}
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
