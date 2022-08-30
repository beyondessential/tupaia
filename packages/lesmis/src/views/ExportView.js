/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FlexColumn, A4PageContent, A4Page } from '@tupaia/ui-components';

import { useDashboardDropdownOptions } from '../utils/useDashboardDropdownOptions';
import { getExportableDashboards, useUrlSearchParams } from '../utils';
import { PreviewPage } from '../components/DashboardExportModal/components';
import { DashboardReportPage, NoReportPage } from '../components/DashboardExportModal/pages';

export const DASHBOARD_EXPORT_PREVIEW = 'DashboardExportPreview';
export const PDF_DOWNLOAD_VIEW = 'PDFDownloadView';

const Container = styled.div`
  min-height: 1000px;
`;

const PreviewPageContent = styled(FlexColumn)`
  margin: 0px 150px;
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
    PageContent: PreviewPageContent,
  },
  [PDF_DOWNLOAD_VIEW]: {
    getExtraExportViewProps: () => {
      const [
        { exportWithLabels: withLabels, exportWithTable: withTable, dashboard },
      ] = useUrlSearchParams();
      const exportWithLabels = !!withLabels;
      const exportWithTable = !!withTable;
      const exportOptions = { exportWithLabels, exportWithTable, dashboard };
      return { exportOptions };
    },
    PageContainer: A4Page,
    PageContent: A4PageContent,
  },
};

const getChildren = ({
  subDashboard,
  isFirstPageProfile,
  exportViewProps,
  PageContainer,
  PageContent,
}) => {
  const { items, useYearSelector, ...subDashboardConfigs } = subDashboard;
  const baseConfigs = {
    useYearSelector,
    subDashboardName: subDashboard.dashboardName,
    PageContainer,
    PageContent,
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

const getExportableDashboardsForDownloadView = dashboardValue => {
  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.filter(({ value }) => value === dashboardValue);
  const { exportableDashboards } = getExportableDashboards(profileDropDownOptions);
  return exportableDashboards;
};

export const ExportView = ({
  viewProps,
  viewType,
  className,
  previewDashboards,
  previewDashboardValue,
}) => {
  const { getExtraExportViewProps, PageContainer, PageContent } = EXPORT_VIEWS[viewType];
  const exportViewProps = { ...viewProps, ...getExtraExportViewProps() };
  const exportableDashboards =
    viewType === DASHBOARD_EXPORT_PREVIEW
      ? previewDashboards
      : getExportableDashboardsForDownloadView(exportViewProps.exportOptions.dashboard);

  return (
    <Container className={className}>
      {exportableDashboards?.map((subDashboard, index) => {
        const isFirstPageProfile =
          viewType === DASHBOARD_EXPORT_PREVIEW
            ? previewDashboardValue === 'profile' && index === 0
            : exportViewProps.exportOptions.dashboard === 'profile' && index === 0;
        return getChildren({
          subDashboard,
          isFirstPageProfile,
          exportViewProps,
          PageContainer,
          PageContent,
        });
      })}
    </Container>
  );
};

ExportView.propTypes = {
  className: PropTypes.string,
  viewProps: PropTypes.object,
  viewType: PropTypes.oneOf([DASHBOARD_EXPORT_PREVIEW, PDF_DOWNLOAD_VIEW]).isRequired,
  previewDashboards: PropTypes.array,
  previewDashboardValue: PropTypes.string,
};

ExportView.defaultProps = {
  className: null,
  viewProps: {},
  previewDashboards: null,
  previewDashboardValue: null,
};
