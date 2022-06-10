import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { DashboardReportPage, NoReportPage } from './pages';
import { yearToApiDates } from '../../api/queries/utils';
import { DEFAULT_DATA_YEAR } from '../../constants';
import { useExportOptions } from './context/ExportOptionsContext';

const Container = styled.div`
  position: relative;
  height: 1600px;
`;

export const DashboardExportPreview = ({ addToRefs, exportableDashboards, currentPage }) => {
  const exportOptions = useExportOptions();
  let page = 0;
  const getNextPage = () => {
    page++;
    return page;
  };

  const getChildren = (subDashboard, isFirstPageProfile) => {
    const { items, useYearSelector, ...configs } = subDashboard;
    const { startDate, endDate } = useYearSelector ? yearToApiDates(DEFAULT_DATA_YEAR) : {};
    const baseConfigs = {
      addToRefs,
      currentPage,
      useYearSelector,
      getNextPage,
      subDashboardName: subDashboard.dashboardName,
      ...configs,
    };

    return items.length > 0 ? (
      subDashboard.items.map((item, index) => {
        return (
          <DashboardReportPage
            key={item.code}
            item={item}
            startDate={startDate}
            endDate={endDate}
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
    <Container>
      {exportableDashboards?.map((subDashboard, index) => {
        const isFirstPageProfile = index === 0;
        return getChildren(subDashboard, isFirstPageProfile);
      })}
    </Container>
  );
};

DashboardExportPreview.propTypes = {
  exportableDashboards: PropTypes.array,
  addToRefs: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

DashboardExportPreview.defaultProps = {
  exportableDashboards: [],
};
