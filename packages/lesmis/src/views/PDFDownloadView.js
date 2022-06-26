/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DashboardExportPreview } from '../components/DashboardExportModal/DashboardExportPreview';

import { getExportableDashboards } from '../utils';
import { useDashboardDropdownOptions } from '../utils/useDashboardDropdownOptions';

export const PDFDownloadView = () => {
  // const { locale, entityCode, view } = useUrlParams();
  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.filter(({ exportToPDF }) => exportToPDF);
  const { exportableDashboards } = getExportableDashboards(profileDropDownOptions);

  return <DashboardExportPreview exportableDashboards={exportableDashboards} />;
};
