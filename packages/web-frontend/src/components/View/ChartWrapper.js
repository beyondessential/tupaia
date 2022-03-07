/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButtonComponent from '@material-ui/lab/ToggleButton';
import BarChartIcon from '@material-ui/icons/BarChart';
import GridOnIcon from '@material-ui/icons/GridOn';
import { Chart, Table } from '@tupaia/ui-components/lib/chart';
import { VIEW_CONTENT_SHAPE } from './propTypes';
import { ChartContainer, ChartViewContainer } from './Layout';
import { FlexEnd } from '../Flexbox';

const CustomChartContainer = styled(ChartContainer)`
  flex-direction: column;
  // recharts components doesn't pass nested styles so they need to be added on a wrapping component
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
`;

const EnlargedChartContainer = styled(CustomChartContainer)`
  .recharts-responsive-container {
    min-height: 360px;
  }
`;

const GREY_DE = '#DEDEE0';
const GREY_FB = '#FBF9F9';
const TEXT_DARKGREY = '#414D55';

const StyledTable = styled(Table)`
  overflow: auto;
  border-bottom: 1px solid rgb(82, 82, 88);

  &.exporting {
    max-width: 100%;
    background: white;
    padding: 30px 0;
    border-bottom: none;

    table {
      border: 1px solid ${GREY_DE};
    }

    // table head
    thead {
      border: 1px solid ${GREY_DE};
      background: none;
    }

    // table body
    tbody {
      tr {
        &:nth-of-type(odd) {
          background: ${GREY_FB};
        }
      }
    }

    th,
    td {
      color: ${TEXT_DARKGREY};
      border-color: ${GREY_DE};
    }
  }
`;

const ToggleButton = styled(ToggleButtonComponent)`
  flex: 1;
  border-color: rgb(82, 82, 88);
  padding: 0.3rem;

  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }

  &.MuiToggleButtonGroup-groupedHorizontal:not(:first-child) {
    border-color: rgb(82, 82, 88);
  }

  &.MuiToggleButton-root.Mui-selected {
    color: white;
    background: ${props => props.theme.palette.primary.main};
  }
`;

export const TABS = {
  CHART: 'chart',
  TABLE: 'table',
};

export const ChartWrapper = ({ viewContent, isEnlarged, isExporting, onItemClick }) => {
  const [selectedTab, setSelectedTab] = useState(TABS.CHART);

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  if (!isEnlarged) {
    return (
      <CustomChartContainer>
        <Chart
          isEnlarged={isEnlarged}
          isExporting={isExporting}
          viewContent={viewContent}
          onItemClick={onItemClick}
        />
      </CustomChartContainer>
    );
  }

  if (isExporting) {
    const { exportWithTable } = viewContent?.presentationOptions;
    return (
      <EnlargedChartContainer $isExporting={isExporting}>
        <Chart
          isEnlarged={isEnlarged}
          isExporting={isExporting}
          viewContent={viewContent}
          onItemClick={onItemClick}
        />
        {exportWithTable && (
          <StyledTable viewContent={viewContent} className={isExporting && 'exporting'} />
        )}
      </EnlargedChartContainer>
    );
  }

  return (
    <ChartViewContainer>
      <FlexEnd>
        <ToggleButtonGroup onChange={handleTabChange} value={selectedTab} exclusive>
          <ToggleButton value={TABS.TABLE}>
            <GridOnIcon />
          </ToggleButton>
          <ToggleButton value={TABS.CHART}>
            <BarChartIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </FlexEnd>
      {selectedTab === TABS.CHART ? (
        <EnlargedChartContainer>
          <Chart
            isEnlarged={isEnlarged}
            isExporting={isExporting}
            viewContent={viewContent}
            onItemClick={onItemClick}
          />
        </EnlargedChartContainer>
      ) : (
        <StyledTable viewContent={viewContent} />
      )}
    </ChartViewContainer>
  );
};

ChartWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

ChartWrapper.defaultProps = {
  viewContent: null,
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
