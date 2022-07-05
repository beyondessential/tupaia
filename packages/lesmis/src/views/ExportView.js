/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDashboardDropdownOptions } from '../utils/useDashboardDropdownOptions';
import { getExportableDashboards, useUrlSearchParams } from '../utils';
import { A4Page, PreviewPage } from '../components/DashboardExportModal/components';
import { DashboardReportPage, NoReportPage } from '../components/DashboardExportModal/pages';

export const DASHBOARD_EXPORT_PREVIEW = 'DashboardExportPreview';
export const PDF_DOWNLOAD_VIEW = 'PDFDownloadView';

const Container = styled.div`
  min-height: 1000px;
`;

const EXPORT_VIEWS = {
  [DASHBOARD_EXPORT_PREVIEW]: {
    getExtraExportViewProps: () => {
      let page = 0;
      const getNextPage = React.useCallback(() => {
        page++;
        return page;
      });
      return { getNextPage };
    },
    PageContainer: PreviewPage,
  },
  [PDF_DOWNLOAD_VIEW]: {
    getExtraExportViewProps: () => {
      let [{ exportWithLabels, exportWithTable }] = useUrlSearchParams();
      exportWithLabels = !!exportWithLabels;
      exportWithTable = !!exportWithTable;
      const exportOptions = { exportWithLabels, exportWithTable };
      return { exportOptions };
    },
    PageContainer: A4Page,
  },
};

const getChildren = (subDashboard, isFirstPageProfile, exportViewProps, PageContainer) => {
  const { items, useYearSelector, ...subDashboardConfigs } = subDashboard;
  const baseConfigs = {
    useYearSelector,
    subDashboardName: subDashboard.dashboardName,
    PageContainer,
    ...subDashboardConfigs,
    ...exportViewProps,
  };

  return items.length > 0 ? (
    subDashboard.items.map((item, index) => {
      return (
        <DashboardReportPage
          key={item.code}
          item={item}
          useYearSelector={useYearSelector}
          isEntityDetailsRequired={isFirstPageProfile && index === 0}
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

export const ExportView = ({ viewProps, viewType }) => {
  const { getExtraExportViewProps, PageContainer } = EXPORT_VIEWS[viewType];
  const exportViewProps = { ...viewProps, ...getExtraExportViewProps() };

  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.filter(({ exportToPDF }) => exportToPDF);
  const { exportableDashboards } = getExportableDashboards(profileDropDownOptions);

  return (
    <Container>
      {exportableDashboards?.map((subDashboard, index) => {
        const isFirstPageProfile = index === 0;
        return getChildren(subDashboard, isFirstPageProfile, exportViewProps, PageContainer);
      })}
    </Container>
  );
};

ExportView.propTypes = {
  viewProps: PropTypes.object,
  viewType: PropTypes.oneOf([DASHBOARD_EXPORT_PREVIEW, PDF_DOWNLOAD_VIEW]).isRequired,
};

ExportView.defaultProps = {
  viewProps: {},
};
