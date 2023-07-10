/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useSearchParams } from 'react-router-dom';
import { Typography, Tabs as MuiTabs, Tab as MuiTab } from '@material-ui/core';
import { TabContext, TabPanel } from '@material-ui/lab';
import { BarChart, GridOn } from '@material-ui/icons';
import { FlexColumn } from '@tupaia/ui-components';
import { hexToRgba } from '@tupaia/utils';
import { DateRangePicker, Modal } from '../../components';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useDashboards } from '../../api/queries';
import { DashboardItemContent } from './DashboardItemContent';
import { useDateRanges } from '../../utils';
import { useReport } from '../../api/queries/useReport';
import { FlippaTable } from '../FlippaTable';

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
`;

const TabsWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;

  .MuiTabs-indicator {
    display: none;
  }
`;

const Tabs = styled(MuiTabs)`
  border: 1px solid ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
  border-radius: 5px;
  min-height: 0;
`;

const Tab = styled(MuiTab)`
  min-width: 0;
  padding: 0.5rem;
  min-height: 0;
  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
  &[aria-selected='true'] {
    background-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const ContentWrapper = styled.div``;

const DISPLAY_TYPE_VIEWS = [
  {
    value: 'chart',
    Icon: BarChart,
    label: 'View chart',
    display: DashboardItemContent,
  },
  {
    value: 'table',
    Icon: GridOn,
    label: 'View table',
    display: FlippaTable,
  },
];
/**
 * EnlargedDashboardItem is the dashboard item modal. It is visible when the report code in the url is equal to the report code of the item.
 */
export const EnlargedDashboardItem = () => {
  const [displayType, setDisplayType] = useState(DISPLAY_TYPE_VIEWS[0].value);
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

  const handleChangeDisplayType = (_event: ChangeEvent<{}>, value: 'chart' | 'table') => {
    setDisplayType(value);
  };

  useEffect(() => {
    // reset the display type to chart when the report code changes
    setDisplayType(DISPLAY_TYPE_VIEWS[0].value);
  }, [reportCode]);

  if (!reportCode || (!isLoadingDashboards && !currentReport)) return null;

  const viewContent = {
    ...(currentReport || {}),
    ...reportData,
  };

  console.log(viewContent);

  // // On close, remove the report search param from the url
  const handleCloseModal = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_PERIOD);
    setUrlSearchParams(urlSearchParams.toString());
  };

  const titleText = `${currentReport?.name}, ${
    currentReport?.entityHeader || activeDashboard?.entityName
  }`;

  const isChart = currentReport?.type === 'chart';

  const availableDisplayTypes = isChart ? DISPLAY_TYPE_VIEWS : [DISPLAY_TYPE_VIEWS[0]];

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
          <TabContext value={displayType}>
            {isChart && (
              <TabsWrapper>
                <Tabs
                  value={displayType}
                  onChange={handleChangeDisplayType}
                  variant="standard"
                  aria-label="Toggle display type"
                >
                  {DISPLAY_TYPE_VIEWS.map(({ value, Icon, label }) => (
                    <Tab key={value} value={value} icon={<Icon />} aria-label={label} />
                  ))}
                </Tabs>
              </TabsWrapper>
            )}
            {availableDisplayTypes.map(({ value, display: Content }) => (
              <ContentWrapper key={value} value={value} as={isChart ? TabPanel : 'div'}>
                <Content
                  viewContent={viewContent}
                  isLoading={isLoadingReportData}
                  error={isError ? error : null}
                  onRetryFetch={refetch}
                  isEnlarged
                  isExpandable={false}
                />
              </ContentWrapper>
            ))}
          </TabContext>
        </Container>
      </Wrapper>
    </Modal>
  );
};
