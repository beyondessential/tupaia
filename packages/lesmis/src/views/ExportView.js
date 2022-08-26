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
      let [{ exportWithLabels, exportWithTable }] = useUrlSearchParams();
      exportWithLabels = !!exportWithLabels;
      exportWithTable = !!exportWithTable;
      const exportOptions = { exportWithLabels, exportWithTable };
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

export const ExportView = ({ viewProps, viewType, className }) => {
  const { getExtraExportViewProps, PageContainer, PageContent } = EXPORT_VIEWS[viewType];
  const exportViewProps = { ...viewProps, ...getExtraExportViewProps() };

  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.filter(({ exportToPDF }) => exportToPDF);
  const { exportableDashboards } = getExportableDashboards(profileDropDownOptions);

  return (
    <Container className={className}>
      {exportableDashboards?.map((subDashboard, index) => {
        const isFirstPageProfile = index === 0;
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
};

ExportView.defaultProps = {
  className: null,
  viewProps: {},
};
