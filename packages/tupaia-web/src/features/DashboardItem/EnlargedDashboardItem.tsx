/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { Typography } from '@material-ui/core';
import { FlexColumn, IconButton } from '@tupaia/ui-components';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useDashboards } from '../../api/queries';
import { DashboardItemContent } from './DashboardItemContent';
import { useDateRanges } from '../../utils';
import { useReport } from '../../api/queries/useReport';
import { DateRangePicker, Modal } from '../../components';
import { DashboardItemType } from '../../types';

const Wrapper = styled.div<{
  $hasBigData?: boolean;
  $applyWidth?: boolean;
}>`
  max-width: 100%;
  min-width: ${({ $hasBigData, $applyWidth }) => ($applyWidth && $hasBigData ? '90vw' : 'auto')};
  width: ${({ $hasBigData, $applyWidth }) => {
    if (!$applyWidth) return 'auto';
    return $hasBigData ? '90%' : '48rem';
  }};
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
  position: relative;
`;

const Subheading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const ContentWrapper = styled.div`
  min-height: 20rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const BackLinkButton = styled(IconButton).attrs({
  component: Link,
  color: 'default',
})`
  position: absolute;
  left: 0;
  top: -0.2rem;
  padding: 0.5rem;
  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const BackLink = ({ parentDashboardItem }: { parentDashboardItem?: DashboardItemType | null }) => {
  const [urlSearchParams] = useSearchParams();
  const location = useLocation();
  if (!parentDashboardItem) return null;
  const { code } = parentDashboardItem;
  // we make a copy of the search params so we don't mutate the original and accidentally change the url
  const searchParams = new URLSearchParams(urlSearchParams);
  searchParams.set(URL_SEARCH_PARAMS.REPORT, code);
  searchParams.delete(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
  const backLink = {
    ...location,
    search: searchParams.toString(),
  };

  return (
    <BackLinkButton to={backLink} title="Back to parent dashboard item">
      <KeyboardArrowLeft />
    </BackLinkButton>
  );
};
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

  const currentDashboardItem = activeDashboard?.items.find(
    (dashboardItem: DashboardItemType) => dashboardItem.code === reportCode,
  );

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
  } = useDateRanges(URL_SEARCH_PARAMS.REPORT_PERIOD, currentDashboardItem);

  // If the report is a drilldown, it will have a drilldown id in the url
  const drilldownId = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
  // At this time we only support drilldown in matrix visuals
  const isDrillDown = currentDashboardItem?.type === 'matrix' && !!drilldownId;
  // If the report is a drilldown, we want to get the parent dashboard item, so that we can get the parameter link for querying the data, and also so that we can show a back button to the correct parent dashboard item
  const parentDashboardItem = isDrillDown
    ? activeDashboard?.items.find(
        report => report.drillDown && report.drillDown.itemCode === reportCode,
      )
    : null;

  // Get the parameters for the report
  const getParameters = () => {
    const params = {
      projectCode,
      entityCode,
      dashboardCode: activeDashboard?.dashboardCode,
      startDate,
      endDate,
      legacy: currentDashboardItem?.legacy,
      itemCode: currentDashboardItem?.code,
    };
    if (!isDrillDown) return params;
    // If the report is a drilldown, we want to add the drilldown id to the params, so that correct data is fetched
    const { parameterLink } = parentDashboardItem.drillDown;
    return {
      ...params,
      [parameterLink]: drilldownId,
    };
  };

  const params = getParameters();
  const { data: reportData, isLoading: isLoadingReportData, error, refetch } = useReport(
    reportCode,
    params,
  );

  if (!reportCode || (!isLoadingDashboards && !currentDashboardItem)) return null;

  // // On close, remove the report search params from the url
  const handleCloseModal = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_PERIOD);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
    setUrlSearchParams(urlSearchParams);
  };

  const titleText = `${currentDashboardItem?.name}, ${
    currentDashboardItem?.entityHeader || activeDashboard?.entityName
  }`;

  const { type, viewType } = currentDashboardItem || {};

  return (
    <Modal isOpen onClose={handleCloseModal}>
      <Wrapper
        $hasBigData={reportData?.data?.length > 20 || type === 'matrix'}
        $applyWidth={viewType !== 'dataDownload'}
      >
        <Container>
          <TitleWrapper>
            <BackLink parentDashboardItem={parentDashboardItem} />
            {currentDashboardItem?.name && <Title>{titleText}</Title>}
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
          {currentDashboardItem?.description && (
            <Subheading>{currentDashboardItem?.description}</Subheading>
          )}
          <ContentWrapper>
            <DashboardItemContent
              isLoading={isLoadingReportData}
              error={error}
              report={reportData}
              config={currentDashboardItem}
              onRetryFetch={refetch}
              isExpandable={false}
              isEnlarged
            />
          </ContentWrapper>
        </Container>
      </Wrapper>
    </Modal>
  );
};
