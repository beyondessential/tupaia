/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DashboardExportPreview } from '../components/DashboardExportModal/DashboardExportPreview';
import { getExportableDashboards, useUrlSearchParams } from '../utils';
import { useDashboardDropdownOptions } from '../utils/useDashboardDropdownOptions';

export const PDFDownloadView = () => {
  let [{ exportWithLabels, exportWithTable }] = useUrlSearchParams();
  exportWithLabels = !!exportWithLabels;
  exportWithTable = !!exportWithTable;
  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.filter(({ exportToPDF }) => exportToPDF);
  const { exportableDashboards } = getExportableDashboards(profileDropDownOptions);

  return (
    <DashboardExportPreview
      exportableDashboards={exportableDashboards}
      exportOptions={{ exportWithLabels, exportWithTable }}
    />
  );
};
