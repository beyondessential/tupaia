/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled, { css } from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { BaseReport, ChartPresentationOptions } from '@tupaia/types';
import { URL_SEARCH_PARAMS } from '../../constants';
import { Modal } from '../../components';
import { Entity } from '../../types';
import { ExportFormats } from '../ExportSettings';
import { EnlargedDashboardVisual } from './EnlargedDashboardVisual';
import {
  ExportDashboardItemContext,
  ExportDashboardItemContextProvider,
  useEnlargedDashboardItem,
} from './utils';
import { ExportButton } from './ExportButton';
import { ExportDashboardItem } from './ExportDashboardItem';

const StyledModal = styled(Modal)`
  .MuiPaper-root:not(.MuiAlert-root) {
    background: ${({ theme }) => theme.palette.background.default};
  }
`;

// MatrixWrapper is an expanding wrapper that allows the matrix to grow to the full width of the screen
const MatrixWrapper = css`
  max-width: 90vw;
  padding: 0 0.5rem;
  width: auto;
`;

// BigChartWrapper is a wrapper that sets the chart to be full width when there is a lot of data. This needs to be separate from MatrixWrapper because recharts needs a fixed width to expand because it calculates the svg width based on the width of the parent div
const BigChartWrapper = css`
  min-width: 90vw;
  width: 90%;
`;

const Wrapper = styled.div<{
  $isMatrix?: boolean;
  $hasBigData?: boolean;
}>`
  min-height: 25rem;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: 0 0.5rem;
  width: 45rem;

  ${({ $isMatrix }) => $isMatrix && MatrixWrapper}
  ${({ $hasBigData }) => $hasBigData && BigChartWrapper}
`;

// needs to be separate from EnlargedDashboardItem to allow use of hook inside ExportDashboardItemContextProvider
const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isExportMode } = useContext(ExportDashboardItemContext);

  const { currentDashboardItem, reportData } = useEnlargedDashboardItem();

  const isMatrix = currentDashboardItem?.config?.type === 'matrix';

  const getHasBigData = () => {
    if (!reportData || isExportMode || currentDashboardItem?.config?.type !== 'chart') return false;
    // only charts with more than 20 data points are considered big. Matrix will expand to fit the screen if there is a lot of data, and 'view' type dashboards are always fixed because the data is semi-static
    const { data } = reportData as BaseReport;
    return data ? data?.length > 20 : false;
  };

  const hasBigData = getHasBigData();

  return (
    <Wrapper $isMatrix={isMatrix} $hasBigData={hasBigData}>
      {children}
    </Wrapper>
  );
};

/**
 * EnlargedDashboardItem is the dashboard item modal. It is visible when there is a reportCode in the URL which is valid, and the dashboard item is loaded.
 */
export const EnlargedDashboardItem = ({ entityName }: { entityName?: Entity['name'] }) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { reportCode, currentDashboardItem, isLoadingDashboards } = useEnlargedDashboardItem();

  const { type } = currentDashboardItem?.config || {};

  const getPresentationOptions = () => {
    if (currentDashboardItem?.config && 'presentationOptions' in currentDashboardItem?.config) {
      return currentDashboardItem?.config?.presentationOptions;
    }
    return {};
  };

  const presentationOptions = getPresentationOptions();

  // not all dashboard item types have these export settings. Realistically, only charts use these
  const getExportSetting = (setting: keyof ChartPresentationOptions, defaultValue: boolean) => {
    if (presentationOptions && setting in presentationOptions) {
      return presentationOptions[setting];
    }
    return defaultValue;
  };

  const exportWithLabels = getExportSetting('exportWithLabels', false);
  const exportWithTable = getExportSetting('exportWithTable', true);
  const exportWithTableDisabled = getExportSetting('exportWithTableDisabled', false);

  if (!reportCode || (!isLoadingDashboards && !currentDashboardItem)) return null;

  // // On close, remove the report search params from the url
  const handleCloseModal = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_PERIOD);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
    setUrlSearchParams(urlSearchParams);
  };

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
        <ContentWrapper>
          <ExportDashboardItem entityName={entityName} />
          <EnlargedDashboardVisual entityName={entityName} />
        </ContentWrapper>
      </ExportDashboardItemContextProvider>
    </StyledModal>
  );
};
