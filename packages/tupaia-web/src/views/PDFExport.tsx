/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { TupaiaWebExportDashboardRequest } from '@tupaia/types';
import { useEntity } from '../api/queries';
import { PDFExportDashboardItem } from '../features';
import { DashboardItem } from '../types';
import { useDashboard, useExportSettings } from '../features/Dashboard';

const A4_RATIO = 1 / 1.41;
const Parent = styled.div<{ $isPreview?: boolean }>`
  color: ${props => props.theme.palette.common.black};
  flex-grow: 1;
  ${({ $isPreview }) => ($isPreview ? `aspect-ratio: ${A4_RATIO};` : '')};
`;

interface PDFExportProps {
  selectedDashboardItems?: TupaiaWebExportDashboardRequest.ReqBody['selectedDashboardItems'];
  isPreview?: boolean;
}

/**
 * This is the view that gets hit by puppeteer when generating a PDF.
 */
export const PDFExport = ({
  selectedDashboardItems: propsSelectedDashboardItems,
  isPreview = false,
}: PDFExportProps) => {
  // Hacky way to change default background color without touching root css. Only apply when generating the pdf, not when in preview mode as it changes the display
  if (!isPreview) {
    document.body.style.backgroundColor = 'white';
  }

  const { projectCode, entityCode } = useParams();

  const [urlSearchParams] = useSearchParams();

  const { activeDashboard } = useDashboard();
  const { exportWithTable, exportWithLabels } = useExportSettings();
  const { data: entity } = useEntity(projectCode, entityCode);

  const getSelectedDashboardItems = () => {
    const urlSelectedDashboardItems = urlSearchParams.get('selectedDashboardItems')?.split(',');

    return propsSelectedDashboardItems || urlSelectedDashboardItems;
  };

  const getSettings = () => {
    const urlSettings = urlSearchParams.get('settings');

    if (urlSettings) {
      return (
        JSON.parse(urlSettings) || {
          exportWithTable,
          exportWithLabels,
        }
      );
    }

    return {
      exportWithTable,
      exportWithLabels,
    };
  };

  const selectedDashboardItems = getSelectedDashboardItems();

  const settings = getSettings();

  if (!activeDashboard) return null;

  const dashboardItems = selectedDashboardItems?.reduce(
    (result: DashboardItem[], code?: string) => {
      const item = (activeDashboard?.items as DashboardItem[])?.find(
        (dashboardItem: DashboardItem) => dashboardItem.code === (code as DashboardItem['code']),
      );
      return item ? [...result, item] : result;
    },
    [],
  );

  return (
    <Parent $isPreview={isPreview}>
      {dashboardItems?.map(dashboardItem => (
        <PDFExportDashboardItem
          key={dashboardItem.code}
          dashboardItem={dashboardItem}
          entityName={entity?.name}
          activeDashboard={activeDashboard}
          isPreview={isPreview}
          settings={settings}
        />
      ))}
    </Parent>
  );
};
