/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { formatDataValueByType } from '@tupaia/utils';
import { ValueType, ChartType } from '@tupaia/types';
import { DEFAULT_DATA_KEY } from '../constants';
import { ExportViewContent, LooseObject, TableAccessor, ChartViewContent } from '../types';
import { formatTimestampForChart, getIsTimeSeries } from './utils';
import { parseChartConfig } from './parseChartConfig';

// For the rowData, ignore labelType and use percentage instead of fractionAndPercentage as
// we don't want to show multiple values a table cell
const sanitizeValueType = (valueType?: ValueType): ValueType | undefined => {
  return valueType === 'fractionAndPercentage' ? 'percentage' : valueType;
};
const getFormattedValue = (value: string | undefined, valueType?: ValueType) =>
  value === undefined ? 'No Data' : formatDataValueByType({ value }, sanitizeValueType(valueType));

const FirstColumnCell = styled.span`
  font-weight: 500;
  text-align: left;
`;

const makeFirstColumn = (header: string, accessor: TableAccessor, sortRows?: Function) => {
  const firstColumn: LooseObject = {
    Header: header,
    accessor,
    Cell: ({ value }: { value: any }) => <FirstColumnCell>{String(value)}</FirstColumnCell>,
  };
  if (sortRows) {
    firstColumn.sortType = sortRows;
  }

  return firstColumn;
};

/**
 * Get columns to render in table
 * Use the keys in chartConfig to determine which columns to render, and if chartConfig doesn't exist
 * use value as the only column
 */
const processColumns = (viewContent: ChartViewContent, sortByTimestamp: Function) => {
  if (!viewContent?.data) {
    return [];
  }

  const { data, periodGranularity, chartType } = viewContent;

  const getXName = () => {
    return chartType === ChartType.Bar ||
      chartType === ChartType.Line ||
      chartType === ChartType.Composed
      ? viewContent.xName
      : undefined;
  };

  const xName = getXName();

  const hasNamedData = data[0]?.name;
  const hasTimeSeriesData = getIsTimeSeries(data) && periodGranularity;
  let firstColumn = null;

  if (hasNamedData) {
    firstColumn = makeFirstColumn(xName || 'Name', 'name');
  }

  if (hasTimeSeriesData) {
    firstColumn = makeFirstColumn(
      xName || 'Date',
      (row: LooseObject) => formatTimestampForChart(row.timestamp, periodGranularity),
      sortByTimestamp,
    );
  }

  const chartConfig = parseChartConfig(viewContent);

  const chartDataConfig =
    Object.keys(chartConfig).length > 0 ? chartConfig : { [DEFAULT_DATA_KEY]: {} };

  const configColumns = Object.keys(chartDataConfig).map(columnKey => {
    return {
      id: columnKey,
      Header: (props: LooseObject) => {
        const columnId = props.column.id;
        return chartConfig[columnId]?.label || columnId;
      },
      accessor: (row: LooseObject) => {
        const rowValue = row[columnKey];
        const columnConfig = chartConfig[columnKey];
        const valueType = columnConfig?.valueType || viewContent.valueType;
        return getFormattedValue(rowValue, valueType);
      },
    };
  });

  return firstColumn ? [firstColumn, ...configColumns] : configColumns;
};

const sortDates = (dateA: Date, dateB: Date) => {
  const dateAMoreRecent = dateA > dateB;
  return dateAMoreRecent ? 1 : -1;
};

const processData = (viewContent: ChartViewContent) => {
  if (!viewContent?.data) {
    return [];
  }

  const { data, chartType } = viewContent;

  if (chartType === ChartType.Pie) {
    return data.sort((a: any, b: any) => b.value - a.value);
  }
  // For time series, sort by timestamp so that the table is in chronological order always
  if (getIsTimeSeries(data)) {
    return data.sort((a: any, b: any) => sortDates(a.timestamp, b.timestamp));
  }

  return data;
};

export const getChartTableData = (viewContent?: ExportViewContent) => {
  // tables only work for charts
  if (!viewContent || viewContent.type !== 'chart') {
    return {
      columns: [],
      data: [],
    };
  }
  // Because react-table wants its sort function to be memoized, it needs to live here, outside of
  // the other useMemo hooks
  const sortByTimestamp = useMemo(
    () => (rowA: any, rowB: any) => sortDates(rowA.original.timestamp, rowB.original.timestamp),
    undefined,
  );
  const columns = useMemo(
    () => processColumns(viewContent, sortByTimestamp),
    [JSON.stringify(viewContent)],
  );
  const data = useMemo(() => processData(viewContent), [JSON.stringify(viewContent)]);
  return {
    columns,
    data,
  };
};
