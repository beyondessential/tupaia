/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { BarChart, GridOn } from '@material-ui/icons';
import { Tabs, darken, lighten, Tab } from '@material-ui/core';
import { TabContext, TabPanel } from '@material-ui/lab';
import { Chart as ChartComponent, ChartTable, ViewContent } from '@tupaia/ui-chart-components';
import { ChartReport, DashboardItemType } from '../types';

const Wrapper = styled.div`
  display: flex;
  position: relative;
  align-content: stretch;
  align-items: stretch;
  flex-direction: column;
  .recharts-responsive-container {
    min-width: 0px;
  }
  .recharts-wrapper {
    font-size: 1rem !important; // this is to make sure the labels on the charts are relative to the base font size
  }
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
`;

const TabsWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;

  .MuiTabs-indicator {
    display: none;
  }
`;

const TabsGroup = styled(Tabs)`
  border: 1px solid
    ${({ theme }) => {
      const {
        text: { primary },
        type,
      } = theme.palette;
      // This is to give the illusion of a thinner border, by blending it into the background more
      return type === 'light' ? lighten(primary, 0.5) : darken(primary, 0.6);
    }};
  border-radius: 5px;
  min-height: 0;
`;

const TabButton = styled(Tab)`
  min-width: 0;
  padding: 0.3rem;
  min-height: 0;
  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
  &[aria-selected='true'] {
    background-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const ContentWrapper = styled.div<{
  $isEnlarged: boolean;
}>`
  padding: ${({ $isEnlarged }) => ($isEnlarged ? '1rem 0' : 'initial')};
  min-height: ${({ $isEnlarged }) =>
    $isEnlarged
      ? '24rem'
      : '0'}; // so that the chart table doesn't shrink the modal size when opened, of doesn't have much data
`;

interface ChartProps {
  report: ChartReport;
  config: DashboardItemType;
  isEnlarged?: boolean;
}

const DISPLAY_TYPE_VIEWS = [
  {
    value: 'chart',
    Icon: BarChart,
    label: 'View chart',
    display: ChartComponent,
  },
  {
    value: 'table',
    Icon: GridOn,
    label: 'View table',
    display: ChartTable,
  },
];

export const Chart = ({ config, report, isEnlarged = false }: ChartProps) => {
  const [displayType, setDisplayType] = useState(DISPLAY_TYPE_VIEWS[0].value);
  const handleChangeDisplayType = (_event: ChangeEvent<{}>, value: 'chart' | 'table') => {
    setDisplayType(value);
  };

  const availableDisplayTypes = isEnlarged ? DISPLAY_TYPE_VIEWS : [DISPLAY_TYPE_VIEWS[0]];

  const viewContent = {
    ...report,
    ...config,
  };

  return (
    <Wrapper>
      <TabContext value={displayType}>
        {isEnlarged && (
          <TabsWrapper>
            <TabsGroup
              value={displayType}
              onChange={handleChangeDisplayType}
              variant="standard"
              aria-label="Toggle display type"
            >
              {DISPLAY_TYPE_VIEWS.map(({ value, Icon, label }) => (
                <TabButton key={value} value={value} icon={<Icon />} aria-label={label} />
              ))}
            </TabsGroup>
          </TabsWrapper>
        )}
        {availableDisplayTypes.map(({ value, display: Content }) => (
          <ContentWrapper
            key={value}
            value={value}
            as={isEnlarged ? TabPanel : 'div'}
            $isEnlarged={isEnlarged}
          >
            <Content
              viewContent={viewContent as ViewContent}
              isEnlarged={isEnlarged}
              isExporting={false}
            />
          </ContentWrapper>
        ))}
      </TabContext>
    </Wrapper>
  );
};
