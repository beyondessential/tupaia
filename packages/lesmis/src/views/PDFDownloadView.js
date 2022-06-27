/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DashboardExportPreview } from '../components/DashboardExportModal/DashboardExportPreview';
import { getExportableDashboards, useUrlSearchParams } from '../utils';
import { useDashboardDropdownOptions } from '../utils/useDashboardDropdownOptions';

export const PDFDownloadView = () => {
  const [{ label, table }] = useUrlSearchParams();
  const exportWithLabels = !!label;
  const exportWithTable = !!table;
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
