import React from 'react';
import MuiBox from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import { useEntityData } from '../api';
import { TabBar } from '../components';
import { SUB_DASHBOARD_OPTIONS } from '../constants';
import { DashboardReportTabView } from '../views/DashboardReportTabView';
import { useI18n } from './I18n';
import { useUrlParams } from './useUrlParams';
import { useUrlSearchParams } from './useUrlSearchParams';

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

export const useDashboardDropdownOptions = () => {
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
      exportToPDF: true,
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
      exportToPDF: true,
      componentProps: {
        Body: 'Free Indicator Selection',
        filterSubDashboards: () => false,
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
      exportToPDF: dashboard.exportToPDF,
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
