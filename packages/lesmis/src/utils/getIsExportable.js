/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SUB_DASHBOARD_OPTIONS } from '../constants';
import { useUrlSearchParams } from './useUrlSearchParams';

export const getIsExportable = () => {
  const [params] = useUrlSearchParams();
  const selectedDashboard = params.dashboard;

  const dropdownOptions = [
    {
      value: 'profile',
      exportToPDF: true,
    },
    {
      value: 'indicators',
      exportToPDF: true,
    },
    {
      value: 'ESSDP_Plan',
    },
    ...SUB_DASHBOARD_OPTIONS.map(dashboard => ({
      value: dashboard.code,

      exportToPDF: dashboard.exportToPDF,
    })),
  ];

  const selectedOption =
    selectedDashboard && dropdownOptions.find(option => option.value === selectedDashboard);
  const isExportable = !!selectedOption.exportToPDF;
  return isExportable;
};
