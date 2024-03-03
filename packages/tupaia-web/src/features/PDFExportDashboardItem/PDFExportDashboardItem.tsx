/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Typography } from '@material-ui/core';
import {
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  getDefaultDates,
  momentToDateDisplayString,
} from '@tupaia/utils';
import {
  BaseReport,
  DashboardItemConfig,
  VizPeriodGranularity,
  TupaiaWebExportDashboardRequest,
} from '@tupaia/types';
import { A4Page, A4_PAGE_WIDTH_PX, ReferenceTooltip } from '@tupaia/ui-components';
import { Dashboard, DashboardItem, Entity } from '../../types';
import { useProject, useReport } from '../../api/queries';
import { DashboardItemContent, DashboardItemContext } from '../DashboardItem';
import { PDFExportHeader } from './PDFExportHeader';

const StyledA4Page = styled(A4Page)<{
  $isPreview?: boolean;
  $previewZoom?: number;
}>`
  ${({ $isPreview, $previewZoom = 0.25 }) =>
    $isPreview ? `width: 100%; zoom: ${$previewZoom};` : ''};
`;

const PDFExportBody = styled.main`
  margin-block: 36pt;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-block: 1rem 1.5rem;
  text-align: center;
`;

const ExportPeriod = styled(Typography)`
  color: ${({ theme }) => theme.palette.common.black};
  text-align: center;
  line-height: 1;
`;

const Description = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-block: 1rem;
  margin-inline: auto;
  max-width: 70ch;
  text-align: center;
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
  margin-block-end: 2.125rem;
`;

export const getDatesAsString = (
  granularity?: `${VizPeriodGranularity}`,
  startDate?: Moment,
  endDate?: Moment,
) => {
  if (!granularity) return null;
  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  // TS complains that there are some values in VizPeriodGranularity that are not in GRANULARITY_CONFIG, although that's not actually true, so we need to cast it in order to use as a key
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

interface PDFExportDashboardItemProps {
  dashboardItem?: DashboardItem;
  entityName?: Entity['name'];
  activeDashboard?: Dashboard;
  isPreview?: boolean;
  settings?: TupaiaWebExportDashboardRequest.ReqBody['settings'];
}

/**
 * This is the dashboard item that gets generated when generating a PDF. It is only present when
 * puppeteer hits this view.
 */
export const PDFExportDashboardItem = ({
  dashboardItem,
  entityName,
  activeDashboard,
  isPreview = false,
  settings,
}: PDFExportDashboardItemProps) => {
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

  const presentationOptions =
    config && 'presentationOptions' in config ? config.presentationOptions : undefined;
  const dashboardItemConfig = {
    ...config,
    presentationOptions: {
      ...presentationOptions,
      ...settings,
    },
  } as DashboardItemConfig;
  const { description, entityHeader, name, periodGranularity, reference } = dashboardItemConfig;

  const { data: project } = useProject(projectCode);
  const projectLogoUrl = project?.logoUrl ?? undefined;
  const projectLogoDescription = project ? `${project.name} logo` : undefined;

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
      <PDFExportHeader imageUrl={projectLogoUrl} imageDescription={projectLogoDescription}>
        {entityName}
      </PDFExportHeader>
      <PDFExportBody>
        <DashboardName>{activeDashboard?.name}</DashboardName>
        <Title>{title}</Title>
        {reference && <ReferenceTooltip reference={reference} />}
        {period && <ExportPeriod>{period}</ExportPeriod>}
        {description && <Description>{description}</Description>}
        <ExportContent $hasData={data && data?.length > 0}>
          <DashboardItemContext.Provider
            value={{
              config: dashboardItemConfig,
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
      </PDFExportBody>
    </StyledA4Page>
  );
};
