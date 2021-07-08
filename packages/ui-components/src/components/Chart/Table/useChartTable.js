/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
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

/**
 * First column is either name or period granularity if they exist in the data
 */
const getFirstColumn = viewContent => {
  const { data, xName, periodGranularity } = viewContent;
  const hasNamedData = data[0]?.name;
  const hasTimeSeriesData = getIsTimeSeries(data) && periodGranularity;

  if (hasNamedData) {
    return {
      Header: xName || '',
      accessor: 'name',
    };
  }

  if (hasTimeSeriesData) {
    return {
      Header: xName || 'Date',
      accessor: row => formatTimestampForChart(row.timestamp, periodGranularity),
    };
  }

  return null;
};

/**
 * Get columns to render in table
 * Use the keys in chartConfig to determine which columns to render, and if chartConfig doesn't exist
 * use value as the only column
 */
const processColumns = viewContent => {
  const baseColumns = getFirstColumn(viewContent) ? [getFirstColumn(viewContent)] : [];

  const chartConfig = parseChartConfig(viewContent);

  if (Object.keys(chartConfig).length === 0) {
    const valueColumn = {
      Header: 'Value',
      accessor: row => getFormattedValue(row[DEFAULT_DATA_KEY], viewContent.valueType),
    };

    return [...baseColumns, valueColumn];
  }

  const configColumns = Object.keys(chartConfig).map(columnKey => {
    return {
      Header: columnKey,
      accessor: row => {
        const rowValue = row[columnKey];
        const columnConfig = chartConfig[columnKey];
        const valueType = columnConfig?.valueType || viewContent.valueType;
        return getFormattedValue(rowValue, valueType);
      },
    };
  });

  return [...baseColumns, ...configColumns];
};

const processData = ({ data, chartType }) => {
  if (chartType === CHART_TYPES.PIE) {
    return data.sort((a, b) => b.value - a.value);
  }
  return data;
};

export const useChartTable = viewContent => {
  const columns = useMemo(() => processColumns(viewContent), []);
  const data = useMemo(() => processData(viewContent), []);
  return useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );
};
