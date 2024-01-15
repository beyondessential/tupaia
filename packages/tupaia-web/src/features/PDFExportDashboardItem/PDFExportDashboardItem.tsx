/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Typography } from '@material-ui/core';
import {
  getDefaultDates,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  momentToDateDisplayString,
} from '@tupaia/utils';
import { BaseReport } from '@tupaia/types';
import { A4_PAGE_WIDTH_PX, A4Page, A4PageContent, ReferenceTooltip } from '@tupaia/ui-components';
import { Dashboard, DashboardItem, DashboardItemConfig, Entity } from '../../types';
import { useReport } from '../../api/queries';
import { DashboardItemContent, DashboardItemContext } from '../DashboardItem';
import { PDFExportHeader } from './PDFExportHeader';

const StyledA4Page = styled(A4Page)<{
  $isPreview?: boolean;
  $previewZoom?: number;
}>`
  ${({ $isPreview, $previewZoom = 0.25 }) =>
    $isPreview ? `width: 100%; zoom: ${$previewZoom};` : ''};
`;

const Wrapper = styled.div`
  margin: 0 7.8rem;
`;
const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  text-align: center;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const ExportPeriod = styled(Typography)`
  color: ${({ theme }) => theme.palette.common.black};
  text-align: center;
  line-height: 1;
`;

const ExportContent = styled.div<{
  $hasData?: boolean;
}>`
  padding-top: ${({ $hasData }) => ($hasData ? '0' : '1.5rem')};
`;

const DashboardName = styled.h2`
  border-block-end: 0.18rem solid ${({ theme }) => theme.palette.common.black};
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  line-height: 1.4;
  margin-block-end: 1.125rem;
`;

export const getDatesAsString = (
  granularity?: keyof typeof GRANULARITIES,
  startDate?: Moment,
  endDate?: Moment,
) => {
  if (!granularity) return null;
  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  const { rangeFormat } = GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG];

  const formattedStartDate = momentToDateDisplayString(
    startDate,
    granularity,
    rangeFormat,
    undefined,
  );
  const formattedEndDate = momentToDateDisplayString(endDate, granularity, rangeFormat, undefined);

  return isSingleDate ? formattedEndDate : `${formattedStartDate} – ${formattedEndDate}`; // En dash
};

/**
 * This is the dashboard item that gets generated when generating a PDF. It is only present when
 * puppeteer hits this view.
 */
export const PDFExportDashboardItem = ({
  dashboardItem,
  entityName,
  activeDashboard,
  isPreview = false,
}: {
  dashboardItem?: DashboardItem;
  entityName?: Entity['name'];
  activeDashboard?: Dashboard;
  isPreview?: boolean;
}) => {
  const [width, setWidth] = useState(0);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pageRef.current) setWidth(pageRef.current.offsetWidth);
  }, []);
  const previewZoom = width / A4_PAGE_WIDTH_PX;

  const { projectCode, entityCode } = useParams();
  const { legacy, code, reportCode } = dashboardItem || ({} as DashboardItem);
  const { startDate, endDate } = getDefaultDates(dashboardItem?.config || {}) as {
    startDate?: Moment;
    endDate?: Moment;
  };

  const {
    data: report,
    isLoading,
    error,
  } = useReport(reportCode, {
    dashboardCode: activeDashboard?.code,
    projectCode,
    entityCode,
    itemCode: code,
    startDate,
    endDate,
    legacy,
  });

  const { config = {} as DashboardItemConfig } = dashboardItem || ({} as DashboardItem);
  const dashboardItemConfig = {
    ...config,
    presentationOptions: {
      ...(config?.presentationOptions || {}),
      exportWithTable: true,
    },
  } as DashboardItemConfig;
  const { reference, name, entityHeader, periodGranularity } = dashboardItemConfig;

  const title = entityHeader ? `${name}, ${entityHeader}` : name;
  const period = getDatesAsString(periodGranularity, startDate, endDate);

  const data = isLoading ? undefined : (report as BaseReport)?.data;
  return (
    <StyledA4Page
      ref={pageRef}
      key={dashboardItem?.code}
      $isPreview={isPreview}
      $previewZoom={previewZoom}
    >
      <PDFExportHeader>{entityName}</PDFExportHeader>
      <A4PageContent>
        <DashboardName>{activeDashboard?.name}</DashboardName>
        <Wrapper>
          <Title>{title}</Title>
          {reference && <ReferenceTooltip reference={reference} />}
          {period && <ExportPeriod>{period}</ExportPeriod>}
          <ExportContent $hasData={data && data?.length > 0}>
            <DashboardItemContext.Provider
              value={{
                config: {
                  ...config,
                  presentationOptions: {
                    ...config.presentationOptions,
                    exportWithTable: true,
                  },
                },
                report,
                reportCode,
                isLoading,
                error,
                isEnlarged: true,
                isExport: true,
              }}
            >
              <DashboardItemContent />
            </DashboardItemContext.Provider>
          </ExportContent>
        </Wrapper>
      </A4PageContent>
    </StyledA4Page>
  );
};
