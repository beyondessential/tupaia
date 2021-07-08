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

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

const DEFAULT_COLUMN = { accessor: DEFAULT_DATA_KEY, Header: 'Value' };

const getDefaultColumns = viewContent => {
  const { data, xName, periodGranularity } = viewContent;
  const isNamedData = data[0]?.name;
  const isTimeSeriesData = getIsTimeSeries(data) && periodGranularity;

  if (isNamedData) {
    return [
      {
        accessor: row =>
          row?.value === undefined
            ? 'No Data'
            : formatDataValueByType({ value: row.value }, sanitizeValueType(viewContent.valueType)),
        Header: xName || 'Description',
      },
      DEFAULT_COLUMN,
    ];
  }

  if (isTimeSeriesData) {
    return [
      {
        accessor: row => formatTimestampForChart(row.timestamp, periodGranularity),
        Header: xName || 'Date',
      },
      DEFAULT_COLUMN,
    ];
  }

  return [DEFAULT_COLUMN];
};

// For the rowData, ignore labelType and use percentage instead of fractionAndPercentage as
// we don't want to show multiple values a table cell
const sanitizeValueType = valueType =>
  valueType === 'fractionAndPercentage' ? 'percentage' : valueType;

/**
 * Get columns to render in table
 * Use the keys in chartConfig to determine which columns to render, and if chartConfig doesn't exist
 * use value as the only column
 */
const processColumns = viewContent => {
  const defaultColumns = getDefaultColumns(viewContent);

  if (!viewContent.chartConfig) {
    return defaultColumns;
  }
  const chartConfig = parseChartConfig(viewContent);

  if (Object.keys(chartConfig).length === 0) {
    return defaultColumns;
  }

  const columns = Object.keys(chartConfig).map(columnKey => {
    return {
      accessor: row => {
        const rowValue = row[columnKey];
        const columnConfig = chartConfig[columnKey];

        return rowValue === undefined
          ? 'No Data'
          : formatDataValueByType(
              { value: rowValue },
              sanitizeValueType(columnConfig?.valueType || viewContent.valueType),
            );
      },
      Header: columnKey,
    };
  });

  return [defaultColumns, ...columns];
};

const processData = viewContent => {
  return viewContent.data;
};

export const Table = ({ viewContent, className }) => {
  const columns = useMemo(() => processColumns(viewContent), []);
  const data = useMemo(() => processData(viewContent), []);

  console.log('columns', columns);
  console.log('data', data);

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
                {row.cells.map(cell => {
                  return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
                })}
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
