/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { A4Page } from '../components/DashboardExportModal/components';
import { DashboardReportPage, NoReportPage } from '../components/DashboardExportModal/pages';
import { getExportableDashboards, useUrlSearchParams } from '../utils';
import { useDashboardDropdownOptions } from '../utils/useDashboardDropdownOptions';

export const PDFDownloadView = () => {
  let [{ exportWithLabels, exportWithTable }] = useUrlSearchParams();
  exportWithLabels = !!exportWithLabels;
  exportWithTable = !!exportWithTable;
  const exportOptions = { exportWithLabels, exportWithTable };

  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.filter(({ exportToPDF }) => exportToPDF);
  const { exportableDashboards } = getExportableDashboards(profileDropDownOptions);

  const getChildren = (subDashboard, isFirstPageProfile) => {
    const { items, useYearSelector, ...configs } = subDashboard;
    const baseConfigs = {
      useYearSelector,
      subDashboardName: subDashboard.dashboardName,
      PageContainer: A4Page,
      ...configs,
    };

    return items.length > 0 ? (
      subDashboard.items.map((item, index) => {
        return (
          <DashboardReportPage
            key={item.code}
            item={item}
            isEntityDetailsRequired={isFirstPageProfile && index === 0}
            exportOptions={exportOptions}
            {...baseConfigs}
          />
        );
      })
    ) : (
      <NoReportPage
        key={subDashboard.dashboardName}
        isEntityDetailsRequired={isFirstPageProfile}
        {...baseConfigs}
      />
    );
  };

  return (
    <div>
      {exportableDashboards?.map((subDashboard, index) => {
        const isFirstPageProfile = index === 0;
        return getChildren(subDashboard, isFirstPageProfile);
      })}
    </div>
  );
};
