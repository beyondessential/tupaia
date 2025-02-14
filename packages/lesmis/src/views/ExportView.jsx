import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { A4_PAGE_WIDTH_PX, FlexColumn } from '@tupaia/ui-components';
import {
  getExportableSubDashboards,
  useDashboardDropdownOptions,
  useUrlSearchParams,
} from '../utils';
import { PreviewPage } from '../components/DashboardExportModal/components';
import { DashboardReportPage, NoReportPage } from '../components/DashboardExportModal/pages';
import { PROFILE_DASHBOARD_CODE } from '../constants';

export const DASHBOARD_EXPORT_PREVIEW = 'DashboardExportPreview';
export const PDF_DOWNLOAD_VIEW = 'PDFDownloadView';

const Container = styled.div`
  min-height: 1000px;
`;

const PreviewPageContent = styled(FlexColumn)`
  margin: 0px 150px;
`;

const A4Page = styled(FlexColumn)`
  width: ${A4_PAGE_WIDTH_PX}px;
  break-after: page;
`;

const A4PageContent = styled(FlexColumn)`
  margin: 0 70px;
`;

const EXPORT_VIEWS = {
  [DASHBOARD_EXPORT_PREVIEW]: {
    getExtraExportViewProps: () => {
      let page = 0;
      const getNextPage = React.useCallback(() => {
        page++;
        return page;
      });
      const [{ dashboard: selectedDashboard }] = useUrlSearchParams();
      return { getNextPage, selectedDashboard };
    },
    PageContainer: PreviewPage,
    PageContent: PreviewPageContent,
  },
  [PDF_DOWNLOAD_VIEW]: {
    getExtraExportViewProps: () => {
      const [
        { exportWithLabels: withLabels, exportWithTable: withTable, dashboard: selectedDashboard },
      ] = useUrlSearchParams();
      const exportWithLabels = !!withLabels;
      const exportWithTable = !!withTable;
      const exportOptions = { exportWithLabels, exportWithTable };
      return { exportOptions, selectedDashboard };
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
    items.map((item, index) => {
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
  const { selectedOption } = useDashboardDropdownOptions();
  const { exportableSubDashboards } = getExportableSubDashboards(selectedOption);
  const isProfileSelected = selectedOption.value === PROFILE_DASHBOARD_CODE;

  return (
    <Container className={className}>
      {exportableSubDashboards?.map((subDashboard, index) => {
        const isFirstPageProfile = isProfileSelected && index === 0;
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
