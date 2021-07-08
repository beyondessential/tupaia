/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { formatDataValueByType } from '@tupaia/utils';
import { formatTimestampForChart, getIsTimeSeries, getIsChartData, getNoDataString } from './utils';
import { SmallAlert } from '../Alert';
import { DEFAULT_DATA_KEY } from './constants';
import { parseChartConfig } from './parseChartConfig';
import { StyledTable } from './StyledTable';
import { FlexStart } from '../Layout';
import { CHART_TYPES } from './constants';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

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

  // console.log('viewContent', viewContent);
  // console.log('chartConfig', chartConfig);

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

export const Table = ({ viewContent, className }) => {
  const columns = useMemo(() => processColumns(viewContent), []);
  const data = useMemo(() => processData(viewContent), []);

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );

  if (!getIsChartData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
  }

  return (
    <TableContainer className={className}>
      <StyledTable {...getTableProps()} style={{ minWidth: columns.length * 140 + 250 }}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <FlexStart>
                    {column.render('Header')}
                    <TableSortLabel
                      active={column.isSorted}
                      direction={column.isSortedDesc ? 'asc' : 'desc'}
                    />
                  </FlexStart>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};

Table.propTypes = {
  viewContent: PropTypes.shape({
    name: PropTypes.string,
    xName: PropTypes.string,
    periodGranularity: PropTypes.string,
    valueType: PropTypes.string,
    labelType: PropTypes.string,
    chartType: PropTypes.string,
    data: PropTypes.array,
    chartConfig: PropTypes.object,
  }),
  className: PropTypes.string,
};

Table.defaultProps = {
  viewContent: null,
  className: null,
};
