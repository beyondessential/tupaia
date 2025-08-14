import React, { useMemo } from 'react';
import styled from 'styled-components';
import { formatDataValueByType } from '@tupaia/utils';
import {
  ValueType,
  ChartType,
  isChartConfig,
  DashboardItemReport,
  ChartReport,
  ChartConfig,
  DashboardItemConfig,
  isChartReport,
} from '@tupaia/types';
import { DEFAULT_DATA_KEY } from '../constants';
import { LooseObject, TableAccessor } from '../types';
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
const processColumns = (report?: ChartReport, config?: ChartConfig, sortByTimestamp?: Function) => {
  if (!report || !report.data) {
    return [];
  }

  const { data } = report;

  const getXName = () => {
    if (config?.type !== 'chart') return undefined;
    return config?.chartType === ChartType.Bar ||
      config?.chartType === ChartType.Line ||
      config?.chartType === ChartType.Composed
      ? config?.xName
      : undefined;
  };

  const xName = getXName();

  const hasNamedData = data[0]?.name;
  const hasTimeSeriesData = getIsTimeSeries(data) && config?.periodGranularity;
  let firstColumn = null;

  if (hasNamedData) {
    firstColumn = makeFirstColumn(xName || 'Name', 'name');
  }

  if (hasTimeSeriesData) {
    const periodTickFormat =
      config &&
      'presentationOptions' in config &&
      typeof config.presentationOptions?.periodTickFormat === 'string' // Must check for string as otherwise might be a PieChart presentationOption
        ? config.presentationOptions?.periodTickFormat
        : undefined;

    firstColumn = makeFirstColumn(
      xName || 'Date',
      (row: LooseObject) =>
        formatTimestampForChart(row.timestamp, config?.periodGranularity, periodTickFormat),
      sortByTimestamp,
    );
  }

  const chartConfig = parseChartConfig(report, config);

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
        const valueType = columnConfig?.valueType || config?.valueType;
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

const processData = (report?: ChartReport, config?: ChartConfig) => {
  if (!report) {
    return [];
  }

  if (config?.chartType === ChartType.Pie) {
    return report.data?.sort((a: any, b: any) => b.value - a.value) ?? [];
  }
  // For time series, sort by timestamp so that the table is in chronological order always

  const { data = [] } = report;
  const isTimeSeries = getIsTimeSeries(data);
  if (isTimeSeries) return data.sort((a: any, b: any) => sortDates(a.timestamp, b.timestamp));

  return data;
};

export const getChartTableData = (report?: DashboardItemReport, config?: DashboardItemConfig) => {
  // Because react-table wants its sort function to be memoized, it needs to live here, outside of
  // the other useMemo hooks. All values need to be memoized, even default values, otherwise it will
  // cause a potentially infinite loop of re-renders.
  // See: [https://github.com/TanStack/table/issues/2369](this issue on GitHub for more information)
  const sortByTimestamp = useMemo(
    () => (rowA: any, rowB: any) => sortDates(rowA.original.timestamp, rowB.original.timestamp),
    undefined,
  );

  const isChartType = isChartReport(report) && isChartConfig(config);
  const columns = useMemo(() => {
    // only process columns if it's a chart, otherwise return an empty array. It won't be used but we have to memoize default values
    return isChartType ? processColumns(report, config, sortByTimestamp) : [];
  }, [JSON.stringify(config), JSON.stringify(report)]);
  const data = useMemo(() => {
    // only process columns if it's a chart, otherwise return an empty array. It won't be used but we have to memoize default values
    return isChartType ? processData(report, config) : [];
  }, [JSON.stringify(config), JSON.stringify(report)]);
  return {
    columns,
    data,
  };
};
