/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { formatDataValueByType } from '@tupaia/utils';
import { formatTimestampForChart, getIsTimeSeries } from '../utils';
import { parseChartConfig } from '../parseChartConfig';
import { CHART_TYPES, DEFAULT_DATA_KEY } from '../constants';

// For the rowData, ignore labelType and use percentage instead of fractionAndPercentage as
// we don't want to show multiple values a table cell
const sanitizeValueType = valueType =>
  valueType === 'fractionAndPercentage' ? 'percentage' : valueType;

const getFormattedValue = (value, valueType) =>
  value === undefined ? 'No Data' : formatDataValueByType({ value }, sanitizeValueType(valueType));

const FirstColumnCell = styled.span`
  font-weight: 500;
  text-align: left;
`;

const makeFirstColumn = (header, accessor, sortRows) => ({
  Header: header,
  accessor,
  sortType: sortRows,
  // eslint-disable-next-line react/prop-types
  Cell: ({ value }) => <FirstColumnCell>{String(value)}</FirstColumnCell>,
});

/**
 * Get columns to render in table
 * Use the keys in chartConfig to determine which columns to render, and if chartConfig doesn't exist
 * use value as the only column
 */
const processColumns = (viewContent, sortByTimestamp) => {
  if (!viewContent?.data) {
    return [];
  }

  const { data, xName, periodGranularity } = viewContent;
  const hasNamedData = data[0]?.name;
  const hasTimeSeriesData = getIsTimeSeries(data) && periodGranularity;
  let firstColumn = null;

  if (hasNamedData) {
    firstColumn = makeFirstColumn(xName || 'Name', 'name');
  }

  if (hasTimeSeriesData) {
    firstColumn = makeFirstColumn(
      xName || 'Date',
      row => formatTimestampForChart(row.timestamp, periodGranularity),
      sortByTimestamp,
    );
  }

  const chartConfig = parseChartConfig(viewContent);

  const chartDataConfig =
    Object.keys(chartConfig).length > 0 ? chartConfig : { [DEFAULT_DATA_KEY]: {} };

  const configColumns = Object.keys(chartDataConfig).map(columnKey => {
    return {
      id: columnKey,
      Header: props => {
        const columnId = props.column.id;
        return chartConfig[columnId]?.label || columnId;
      },
      accessor: row => {
        const rowValue = row[columnKey];
        const columnConfig = chartConfig[columnKey];
        const valueType = columnConfig?.valueType || viewContent.valueType;
        return getFormattedValue(rowValue, valueType);
      },
    };
  });

  return firstColumn ? [firstColumn, ...configColumns] : configColumns;
};

const processData = viewContent => {
  if (!viewContent?.data) {
    return [];
  }

  const { data, chartType } = viewContent;

  if (chartType === CHART_TYPES.PIE) {
    return data.sort((a, b) => b.value - a.value);
  }
  return data;
};

export const getChartTableData = viewContent => {
  // Because react-table wants its sort function to be memoized, it needs to live here, outside of
  // the other useMemo hooks
  const sortByTimestamp = useMemo(() => (rowA, rowB) => {
    const rowAMoreRecent = rowA.original.timestamp > rowB.original.timestamp;
    return rowAMoreRecent ? 1 : -1;
  });
  const columns = useMemo(() => processColumns(viewContent, sortByTimestamp), [
    JSON.stringify(viewContent),
  ]);
  const data = useMemo(() => processData(viewContent), [JSON.stringify(viewContent)]);
  return {
    columns,
    data,
  };
};
