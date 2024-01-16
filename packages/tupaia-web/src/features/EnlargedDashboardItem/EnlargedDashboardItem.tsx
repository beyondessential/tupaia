/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { BaseReport, ViewConfig } from '@tupaia/types';
import { URL_SEARCH_PARAMS } from '../../constants';
import { Modal } from '../../components';
import { Entity } from '../../types';
import { ExportFormats } from '../ExportSettings';
import { ExportDashboardItem } from './ExportDashboardItem';
import { EnlargedDashboardVisual } from './EnlargedDashboardVisual';
import {
  ExportDashboardItemContext,
  ExportDashboardItemContextProvider,
  useEnlargedDashboardItem,
} from './utils';
import { ExportButton } from './ExportButton';

const StyledModal = styled(Modal)`
  .MuiPaper-root:not(.MuiAlert-root) {
    background: ${({ theme }) => theme.palette.background.default};
  }
`;

const Wrapper = styled.div<{
  $hasBigData?: boolean;
}>`
  max-width: 100%;
  min-width: ${({ $hasBigData }) => ($hasBigData ? '90vw' : 'auto')};
  width: ${({ $hasBigData }) => ($hasBigData ? '90%' : '45rem')};
  min-height: 25rem;
  display: flex;
  flex-direction: column;
`;

// needs to be separate from EnlargedDashboardItem to allow use of hook inside ExportDashboardItemContextProvider
const ContentWrapper = ({
  hasBigData,
  children,
}: {
  hasBigData: boolean;
  children: React.ReactNode;
}) => {
  const { isExportMode } = useContext(ExportDashboardItemContext);
  return <Wrapper $hasBigData={!isExportMode && hasBigData}>{children}</Wrapper>;
};

/**
 * EnlargedDashboardItem is the dashboard item modal. It is visible when there is a reportCode in the URL which is valid, and the dashboard item is loaded.
 */
export const EnlargedDashboardItem = ({ entityName }: { entityName?: Entity['name'] }) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { reportCode, currentDashboardItem, isLoadingDashboards, reportData } =
    useEnlargedDashboardItem();

  const { type, presentationOptions } = currentDashboardItem?.config || {};

  const {
    exportWithLabels = false,
    exportWithTable = true,
    exportWithTableDisabled = false,
  } = presentationOptions || {};

  if (!reportCode || (!isLoadingDashboards && !currentDashboardItem)) return null;

  // // On close, remove the report search params from the url
  const handleCloseModal = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_PERIOD);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
    setUrlSearchParams(urlSearchParams);
  };

  const isDataDownload =
    (currentDashboardItem?.config as unknown as ViewConfig)?.viewType === 'dataDownload';

  const getHasBigData = () => {
    if (isDataDownload || !reportData) return false;
    else if (type === 'matrix') return true;
    const { data } = reportData as BaseReport;
    return data ? data?.length > 20 : false;
  };
  const hasBigData = getHasBigData();

  return (
    <StyledModal isOpen onClose={handleCloseModal}>
      <ExportDashboardItemContextProvider
        defaultSettings={{
          exportWithLabels,
          exportWithTable,
          exportWithTableDisabled,
          exportFormat: type === 'matrix' ? ExportFormats.XLSX : ExportFormats.PNG,
        }}
      >
        <ExportButton />
        <ContentWrapper hasBigData={hasBigData}>
          <ExportDashboardItem entityName={entityName} />
          <EnlargedDashboardVisual entityName={entityName} />
        </ContentWrapper>
      </ExportDashboardItemContextProvider>
    </StyledModal>
  );
};
