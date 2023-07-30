/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useDashboards, useEntity } from '../api/queries';
import { useSearchParams } from 'react-router-dom';
import { PDFExportDashboardItem } from '../features';
import { DashboardItem } from '../types';

const Parent = styled.div`
  color: ${props => props.theme.palette.common.black};
`;

export const PDFExport = () => {
  // Hacky way to change default background color without touching root css.
  document.body.style.backgroundColor = 'white';

  const { projectCode, entityCode, dashboardName } = useParams();
  const [urlSearchParams] = useSearchParams();
  const { activeDashboard } = useDashboards(projectCode, entityCode, dashboardName);
  const { data: entity } = useEntity(projectCode, entityCode);
  const selectedDashboardItems = urlSearchParams.get('selectedDashboardItems')?.split(',');

  if (!activeDashboard) return null;

  const dashboardItems = selectedDashboardItems?.reduce(
    (result: DashboardItem[], code?: string) => {
      const item = (activeDashboard?.items as DashboardItem[])?.find(
        (item: DashboardItem) => item.code === (code as DashboardItem['code']),
      );
      return item ? [...result, item] : result;
    },
    [],
  );

  return (
    <Parent>
      {dashboardItems?.map(dashboardItem => (
        <PDFExportDashboardItem
          key={dashboardItem.code}
          dashboardItem={dashboardItem}
          entityName={entity?.name}
          activeDashboard={activeDashboard}
        />
      ))}
    </Parent>
  );
};
