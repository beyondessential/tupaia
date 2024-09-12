/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, useContext, useState } from 'react';
import styled from 'styled-components';
import { BarChart, GridOn } from '@material-ui/icons';
import { Tabs, darken, lighten, Tab } from '@material-ui/core';
import { TabContext, TabPanel } from '@material-ui/lab';
import { Chart as ChartComponent, ChartTable } from '@tupaia/ui-chart-components';
import { A4Page, ErrorBoundary } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT } from '../../constants';
import { DashboardItemContext } from '../DashboardItem';

const GREY_DE = '#DEDEE0';
const GREY_FB = '#FBF9F9';
const TEXT_DARKGREY = '#414D55';

const ScreenChartTable = styled(ChartTable).attrs({
  stickyHeader: true,
  className: 'flippa-table',
})`
  &:has(.MuiTable-stickyHeader) {
    max-height: clamp(20rem, 60rem, 55vh);
  }
  table {
    table-layout: unset;
  }
`;

const ExportingStyledTable = styled(ChartTable)`
  max-height: none;
  border: none;
  padding: 1.8rem 0;
  overflow: unset; // so that any horizontal scroll bar is applied to the parent container, not to the table

  table {
    border: 1px solid ${GREY_DE};
    width: auto;
    .MuiTableRow-root {
      background-color: transparent;
    }
  }

  ${A4Page} & {
    table {
      width: 100%;
    }
  }

  [role='button'] {
    display: none; // hide the sort buttons
  }

  // table head
  thead {
    border: 1px solid ${GREY_DE};
    background: none;
  }

  // table body
  tbody {
    .MuiTableRow-root {
      &:nth-of-type(even) {
        background: transparent;
      }
      &:nth-of-type(odd) {
        background: ${GREY_FB};
      }
    }
  }

  .MuiTableCell-root {
    color: ${TEXT_DARKGREY};
    border-color: ${GREY_DE};
    &:not(.MuiTableCell-head) {
      border: 1px solid ${GREY_DE};
    }
  }
`;
const Wrapper = styled.div`
  display: flex;
  position: relative;
  align-content: stretch;
  align-items: stretch;
  flex-direction: column;
  .recharts-responsive-container {
    min-width: 0px;
    height: 100%;
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
  $isEnlarged?: boolean;
  $isExporting?: boolean;
}>`
  pointer-events: ${({ $isExporting }) => ($isExporting ? 'none' : 'initial')};
  padding: ${({ $isEnlarged }) => ($isEnlarged ? '1rem 0' : 'initial')};
  height: ${({ $isExporting }) =>
    $isExporting ? 'auto' : '15rem'}; // to stop charts from shrinking to nothing at mobile size
  min-height: ${({ $isEnlarged, $isExporting }) => {
    if ($isExporting) return '5rem'; // mainly for the 'no data' message
    if ($isEnlarged) return '24rem';
    return 0; // so that the chart table doesn't shrink the modal size when opened, of doesn't have much data
  }};
  ${A4Page} & {
    padding: 0;
    height: auto;
  }
  @media (min-width: ${MOBILE_BREAKPOINT}) {
    height: ${({ $isExporting }) => ($isExporting ? 'auto' : '100%')};
  }
`;

type View = {
  value: 'chart' | 'table';
  Icon: React.ElementType;
  label: string;
  Component: React.ElementType;
};

const DISPLAY_TYPE_VIEWS: View[] = [
  {
    value: 'chart',
    Icon: BarChart,
    label: 'View chart',
    Component: ChartComponent,
  },
  {
    value: 'table',
    Icon: GridOn,
    label: 'View table',
    Component: ScreenChartTable,
  },
];

const EXPORT_DISPLAY_TYPE_VIEWS: View[] = [
  {
    value: 'chart',
    Icon: BarChart,
    label: 'View chart',
    Component: ChartComponent,
  },
  {
    value: 'table',
    Icon: GridOn,
    label: 'View table',
    Component: ExportingStyledTable,
  },
];

export const Chart = () => {
  const [displayType, setDisplayType] = useState(DISPLAY_TYPE_VIEWS[0].value);
  const { report, config, isEnlarged, isExport } = useContext(DashboardItemContext);
  const handleChangeDisplayType = (_event: ChangeEvent<{}>, value: 'chart' | 'table') => {
    setDisplayType(value);
  };
  const shouldUseTabs = isEnlarged && !isExport;

  const getShowTable = () => {
    if (!isEnlarged) return false;
    if (!isExport) return true;
    // type guard because presentationOptions is not on all viz types and not all vizes with presentationOptions have exportWithTable as an option
    if (
      config &&
      'presentationOptions' in config &&
      config.presentationOptions &&
      'exportWithTable' in config.presentationOptions
    ) {
      const { exportWithTable } = config.presentationOptions;
      return exportWithTable === true;
    }
    return false;
  };
  const showTable = getShowTable();

  const views = isExport ? EXPORT_DISPLAY_TYPE_VIEWS : DISPLAY_TYPE_VIEWS;
  const availableDisplayTypes = showTable ? views : [views[0]];

  return (
    <ErrorBoundary>
      <Wrapper>
        <TabContext value={displayType}>
          {shouldUseTabs && (
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
          {availableDisplayTypes.map(({ value, Component }) => (
            <ContentWrapper
              key={value}
              value={value}
              as={shouldUseTabs ? TabPanel : 'div'}
              $isEnlarged={isEnlarged}
              $isExporting={isExport}
            >
              <Component
                report={report}
                config={config}
                isEnlarged={!!isEnlarged}
                isExporting={!!isExport}
              />
            </ContentWrapper>
          ))}
        </TabContext>
      </Wrapper>
    </ErrorBoundary>
  );
};
