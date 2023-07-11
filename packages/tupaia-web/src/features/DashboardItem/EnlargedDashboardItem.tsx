/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams, useSearchParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { FlexColumn } from '@tupaia/ui-components';
import { DateRangePicker, Modal } from '../../components';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useDashboards } from '../../api/queries';
import { DashboardItemContent } from './DashboardItemContent';
import { useDateRanges } from '../../utils';
import { useReport } from '../../api/queries/useReport';

const Wrapper = styled.div<{
  $hasBigData?: boolean;
}>`
  max-width: 100%;
  min-width: ${({ $hasBigData }) => ($hasBigData ? '90vw' : 'auto')};
  width: ${({ $hasBigData }) => ($hasBigData ? '90%' : '48rem')};
`;

const Container = styled(FlexColumn)`
  width: 100%;
  height: 100%;
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
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
`;

const TitleWrapper = styled(FlexColumn)`
  align-items: center;
  margin-bottom: 1rem;
`;

const Subheading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  margin-bottom: 1rem;
`;

/**
 * EnlargedDashboardItem is the dashboard item modal. It is visible when the report code in the url is equal to the report code of the item.
 */
export const EnlargedDashboardItem = () => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const reportCode = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT);

  const { activeDashboard, isLoading: isLoadingDashboards } = useDashboards(
    projectCode,
    entityCode,
    dashboardName,
  );

  const currentReport = activeDashboard?.items.find(report => report.code === reportCode);

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
  } = useDateRanges(URL_SEARCH_PARAMS.REPORT_PERIOD, currentReport);

  const { data: reportData, isLoading: isLoadingReportData, error, isError, refetch } = useReport(
    reportCode,
    {
      projectCode,
      entityCode,
      dashboardCode: activeDashboard?.dashboardCode,
      startDate,
      endDate,
      legacy: currentReport?.legacy,
      itemCode: currentReport?.code,
    },
  );

  if (!reportCode || (!isLoadingDashboards && !currentReport)) return null;

  const viewContent = {
    ...(currentReport || {}),
    ...reportData,
  };

  // // On close, remove the report search param from the url
  const handleCloseModal = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_PERIOD);
    setUrlSearchParams(urlSearchParams.toString());
  };

  const titleText = `${currentReport?.name}, ${
    currentReport?.entityHeader || activeDashboard?.entityName
  }`;

  return (
    <Modal isOpen onClose={handleCloseModal}>
      <Wrapper $hasBigData={reportData?.data?.length > 20 || currentReport?.type === 'matrix'}>
        <Container>
          <TitleWrapper>
            {currentReport?.name && <Title>{titleText}</Title>}
            {showDatePicker && (
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
          {currentReport?.description && <Subheading>{currentReport?.description}</Subheading>}
          <DashboardItemContent
            viewContent={viewContent}
            isLoading={isLoadingReportData}
            error={isError ? error : null}
            onRetryFetch={refetch}
            isEnlarged
            isExpandable={false}
          />
        </Container>
      </Wrapper>
    </Modal>
  );
};
