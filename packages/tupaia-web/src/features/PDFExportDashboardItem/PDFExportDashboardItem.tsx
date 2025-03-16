import { Typography } from '@material-ui/core';
import { Property } from 'csstype';
import { Moment } from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import styled, { css } from 'styled-components';

import {
  BaseReport,
  DashboardItemConfig,
  TupaiaWebExportDashboardRequest,
  VizPeriodGranularity,
} from '@tupaia/types';
import { A4Page, ReferenceTooltip } from '@tupaia/ui-components';
import {
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  getDefaultDates,
  momentToDateDisplayString,
} from '@tupaia/utils';

import { useProject, useReport } from '../../api/queries';
import { Dashboard, DashboardItem, Entity } from '../../types';
import { DashboardItemContent, DashboardItemContext } from '../DashboardItem';
import { PDFExportHeader } from './PDFExportHeader';

const StyledA4Page = styled(A4Page)<{
  $isPreview?: boolean;
  $previewZoom?: Property.Zoom;
}>`
  width: 31.512cm;
  ${({ $isPreview, $previewZoom = 0.25 }) =>
    $isPreview &&
    css`
      width: 100%;
      zoom: ${$previewZoom};
    `};
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

const ExportDescription = styled(Typography)`
  margin-bottom: 0.3rem;
  word-break: break-word;
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
  displayDescription?: boolean;
  displayHeader?: boolean;
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
  displayDescription = false,
  displayHeader,
}: PDFExportDashboardItemProps) => {
  const [width, setWidth] = useState(0);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pageRef.current) setWidth(pageRef.current.offsetWidth);
  }, []);

  // Semantically, this magic number should be 21cm (A4 width) in pixels (at CSS’s fixed
  // 1 inch : 96px ratio). This was previously defined incorrectly as 1191 in @tupaia/ui-components.
  // The value of A4_PAGE_WIDTH_PX has since been fixed in @tupaia/ui-components, but here we use
  // the old value to preserve existing layout behaviour.
  const previewZoom = width / 1191;

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

  const { separatePagePerItem, ...restOfSettings } = settings || {};
  const presentationOptions =
    config && 'presentationOptions' in config ? config.presentationOptions : undefined;
  const dashboardItemConfig = {
    ...config,
    presentationOptions: {
      ...presentationOptions,
      ...restOfSettings,
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
      separatePage={separatePagePerItem}
    >
      {displayHeader && (
        <PDFExportHeader imageUrl={projectLogoUrl} imageDescription={projectLogoDescription}>
          {entityName}
        </PDFExportHeader>
      )}
      <main>
        {displayHeader && (
          <DashboardName>
            {activeDashboard?.name}
            {displayDescription && (
              <ExportDescription>{settings?.exportDescription}</ExportDescription>
            )}
          </DashboardName>
        )}
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
      </main>
    </StyledA4Page>
  );
};
