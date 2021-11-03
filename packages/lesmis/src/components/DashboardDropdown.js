/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useUrlParams, useUrlSearchParams } from '../utils';
import { useEntityData } from '../api/queries';
import { DashboardReportTabView } from '../views/DashboardReportTabView';
import styled from 'styled-components';
import { Select } from '@tupaia/ui-components';
import { TabBar } from './Tabs';
import MuiBox from '@material-ui/core/Box';
import PropTypes from 'prop-types';

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

const DASHBOARDS = {
  essdpPlan: 'LESMIS_ESSDP_Plan',
  essdpEarlyChildhood: 'LESMIS_ESSDP_EarlyChildhood',
  essdpPrimary: 'LESMIS_ESSDP_Primary',
  essdpLowerSecondary: 'LESMIS_ESSDP_LowerSecondary',
  essdpUpperSecondary: 'LESMIS_ESSDP_UpperSecondary',
  internationalSDGs: 'LESMIS_International_SDGs',
  emergencyInEducation: 'LESMIS_EmergencyInEducation',
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

const useDashboardDropdownOptions = () => {
  const { entityCode } = useUrlParams();
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
        filterSubDashboards: ({ dashboardCode }) =>
          !Object.values(DASHBOARDS).some(code => dashboardCode.startsWith(code)), // those not included anywhere else
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
        filterSubDashboards: ({ dashboardCode }) => dashboardCode.startsWith(DASHBOARDS.essdpPlan),
      },
    },
    {
      value: 'essdpEarlyChildhood',
      label: 'ESSDP Early childhood education sub-sector',
      TabComponent: DashboardReportTabView,
      componentProps: {
        filterSubDashboards: ({ dashboardCode }) =>
          dashboardCode.startsWith(DASHBOARDS.essdpEarlyChildhood),
      },
    },
    {
      value: 'essdpPrimary',
      label: 'ESSDP Primary sub-sector',
      TabComponent: DashboardReportTabView,
      componentProps: {
        filterSubDashboards: ({ dashboardCode }) =>
          dashboardCode.startsWith(DASHBOARDS.essdpPrimary),
      },
    },
    {
      value: 'essdpLowerSecondary',
      label: 'ESSDP Lower secondary sub-sector',
      TabComponent: DashboardReportTabView,
      componentProps: {
        filterSubDashboards: ({ dashboardCode }) =>
          dashboardCode.startsWith(DASHBOARDS.essdpLowerSecondary),
      },
    },
    {
      value: 'essdpUpperSecondary',
      label: 'ESSDP Upper secondary sub-sector',
      TabComponent: DashboardReportTabView,
      componentProps: {
        filterSubDashboards: ({ dashboardCode }) =>
          dashboardCode.startsWith(DASHBOARDS.essdpUpperSecondary),
      },
    },
    {
      value: 'emergency',
      label: 'Emergency in Education Preparedness and Response',
      TabComponent: DashboardReportTabView,
      componentProps: {
        filterSubDashboards: ({ dashboardCode }) =>
          dashboardCode.startsWith(DASHBOARDS.emergencyInEducation),
      },
    },
    {
      value: 'internationalSDGs',
      label: 'International reporting on SDGs',
      TabComponent: DashboardReportTabView,
      componentProps: {
        filterSubDashboards: ({ dashboardCode }) =>
          dashboardCode.startsWith(DASHBOARDS.internationalSDGs),
      },
    },
  ];

  // default option
  let selectedOption = dropdownOptions[0];

  // check if the selected dashboard is valid
  if (selectedDashboard && dropdownOptions.find(option => option.value === selectedDashboard)) {
    selectedOption = dropdownOptions.find(option => option.value === selectedDashboard);
  }

  return { dropdownOptions, selectedOption };
};

export const DashboardDropdown = () => {
  const { dropdownOptions, selectedOption } = useDashboardDropdownOptions();

  const handleDashboardChange = event => {
    setParams({ dashboard: event.target.value, subDashboard: null });
  };

  return (
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
  );
};
