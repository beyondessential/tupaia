/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import moment, { Moment } from 'moment';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { FlexColumn } from '@tupaia/ui-components';
import { URL_SEARCH_PARAMS } from '../../constants';
import { DashboardItemContent } from '../DashboardItem/DashboardItemContent';
import { useDateRanges } from '../../utils';
import { DateRangePicker } from '../../components';
import { Entity } from '../../types';
import { BackLink } from './BackLink';
import { ExportContext, useEnlargedDashboardItem } from './utils';

const Container = styled(FlexColumn)`
  width: 100%;
  height: 100%;
  flex: 1;
  .recharts-responsive-container {
    min-height: 22.5rem;
  }
  .recharts-cartesian-axis-tick {
    font-size: 0.875rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  text-align: center;
  margin: 1rem 0;
  line-height: 1.4;
`;

const TitleWrapper = styled(FlexColumn)`
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
`;

const Subheading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

interface EnlargedDashboardVisualProps {
  entityName?: Entity['name'];
  isPreview?: boolean;
}

const ExportDate = styled(Typography)`
  color: #333333;
  font-size: 0.75rem;
  padding-top: 1rem;
  padding-bottom: 0.3rem;
`;
/*
 * EnlargedDashboardVisual is the enlarged dashboard item report visuals. It handles the case of a preview as well as the regular enlarged dashboard item.
 */
export const EnlargedDashboardVisual = ({
  entityName,
  isPreview,
}: EnlargedDashboardVisualProps) => {
  const { isExportMode, exportWithLabels, exportWithTable } = useContext(ExportContext);
  const {
    currentDashboardItem,
    parentDashboardItem,
    reportData,
    reportError,
    refetchReportData,
    isLoadingReportData,
  } = useEnlargedDashboardItem();

  const {
    startDate,
    endDate,
    setDates,
    showDatePicker,
    minStartDate,
    maxEndDate,
    periodGranularity,
    weekDisplayFormat,
    onResetDate,
  } = useDateRanges(URL_SEARCH_PARAMS.REPORT_PERIOD, currentDashboardItem?.config);

  const { config } = currentDashboardItem || {};

  // @ts-ignore - entityHeader is in all lowercase in the types config
  const titleText = `${config?.name}, ${config?.entityHeader || entityName}`;

  // Don't render the visual if we're in export mode and this is not a preview
  if (isExportMode && !isPreview) return null;
  // format the dates for export
  const formatDate = (date: Moment | string) => moment(date).format('DD/MM/YY');

  // today's date for export
  const date = String(moment());
  return (
    <Container>
      <TitleWrapper>
        <BackLink parentDashboardItem={parentDashboardItem} />
        {config?.name && <Title>{titleText}</Title>}
        {showDatePicker && !isExportMode && (
          <DateRangePicker
            granularity={periodGranularity}
            onSetDates={setDates}
            startDate={startDate}
            endDate={endDate}
            minDate={minStartDate}
            maxDate={maxEndDate}
            weekDisplayFormat={weekDisplayFormat}
            onResetDate={onResetDate}
          />
        )}
      </TitleWrapper>
      {config?.description && <Subheading>{config?.description}</Subheading>}
      <ContentWrapper>
        <DashboardItemContent
          isLoading={isLoadingReportData}
          error={reportError}
          report={reportData}
          dashboardItem={{
            ...currentDashboardItem,
            config: {
              ...currentDashboardItem?.config,
              presentationOptions: {
                ...currentDashboardItem?.config?.presentationOptions,
                exportWithLabels,
                exportWithTable,
              },
            },
          }}
          onRetryFetch={refetchReportData}
          isExpandable={false}
          isEnlarged
          isExporting={isPreview}
        />
        {isPreview && (
          <ExportDate>
            {startDate &&
              endDate &&
              `Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}. `}
            Exported on {date} from Tupaia.org
          </ExportDate>
        )}
      </ContentWrapper>
    </Container>
  );
};
