import React from 'react';
import PropTypes from 'prop-types';

import { DashboardReportPage, NoReportPage } from './pages';

export const DashboardExportPreview = ({
  addToRefs,
  exportableDashboards,
  currentPage,
  isExporting,
  exportOptions,
}) => {
  let page = 0;
  const getNextPage = React.useCallback(() => {
    page++;
    return page;
  });

  const getChildren = (subDashboard, isFirstPageProfile) => {
    const { items, useYearSelector, ...configs } = subDashboard;
    const baseConfigs = {
      addToRefs,
      currentPage,
      useYearSelector,
      getNextPage,
      subDashboardName: subDashboard.dashboardName,
      isExporting,
      ...configs,
    };

    return items.length > 0 ? (
      subDashboard.items.map((item, index) => {
        return (
          <DashboardReportPage
            key={item.code}
            item={item}
            useYearSelector={useYearSelector}
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

DashboardExportPreview.propTypes = {
  exportableDashboards: PropTypes.array,
  addToRefs: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  isExporting: PropTypes.bool.isRequired,
  exportOptions: PropTypes.object.isRequired,
};

DashboardExportPreview.defaultProps = {
  exportableDashboards: [],
};
