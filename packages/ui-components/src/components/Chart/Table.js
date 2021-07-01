/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import { formatDataValueByType } from '@tupaia/utils';
import { formatTimestampForChart, getIsTimeSeries, getIsChartData, getNoDataString } from './utils';
import { SmallAlert } from '../Alert';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

const DARK_THEME_BORDER = 'rgb(82, 82, 88)';

const StyledTable = styled(MuiTable)`
  table-layout: fixed;
  overflow: hidden;

  // table head
  thead {
    text-transform: capitalize;
    border-bottom: 1px solid
      ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.grey['400'] : DARK_THEME_BORDER};

    tr {
      background: none;
    }

    th {
      position: relative;
      text-align: center;
      border: none;
      font-weight: 400;
      vertical-align: bottom;
    }
  }

  // table body
  tbody {
    th {
      font-weight: 500;
    }

    tr {
      &:nth-of-type(odd) {
        background: ${({ theme }) =>
          theme.palette.type === 'light' ? theme.palette.grey['100'] : 'none'};
      }
      &:last-child th,
      &:last-child td {
        border-bottom: none;
      }
    }
  }

  th,
  td {
    padding-top: 1.125rem;
    padding-bottom: 1.125rem;
    color: ${props => props.theme.palette.text.primary};
    border-right: 1px solid
      ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.grey['400'] : DARK_THEME_BORDER};

    &:last-child {
      border-right: none;
    }
  }

  td {
    text-align: center;
  }
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

const getColumns = rawData => {
  const columns = [];
  rawData.forEach(row => {
    Object.keys(row)
      .filter(key => key !== 'name' && key !== 'timestamp')
      .forEach(key => {
        // add the key as a table column but filter out object values such as metadata
        if (!columns.includes(key) && typeof row[key] !== 'object') {
          columns.push(key);
        }
      });
  });

  return columns;
};

// For the rowData, ignore labelType and use percentage instead of fractionAndPercentage as
// we don't want to show multiple values a table cell
const sanitizeValueType = valueType =>
  valueType === 'fractionAndPercentage' ? 'percentage' : valueType;

export const Table = ({ viewContent, className }) => {
  const { data, xName, periodGranularity, valueType } = viewContent;
  const columns = getColumns(data);
  const dataIsTimeSeries = getIsTimeSeries(data) && periodGranularity;

  if (!getIsChartData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
  }

  return (
    <TableContainer className={className}>
      <StyledTable style={{ minWidth: columns.length * 140 + 250 }}>
        <MuiTableHead>
          <MuiTableRow>
            <MuiTableCell width={250}>{xName || null}</MuiTableCell>
            {columns.map(column => (
              <MuiTableCell key={column}>{column}</MuiTableCell>
            ))}
          </MuiTableRow>
        </MuiTableHead>
        <MuiTableBody>
          {data.map(row => (
            <MuiTableRow key={row.timestamp || row.name}>
              <MuiTableCell component="th" scope="row">
                {dataIsTimeSeries
                  ? formatTimestampForChart(row.timestamp, periodGranularity)
                  : row.name}
              </MuiTableCell>
              {columns.map(column => {
                const value = row[column];

                const rowValue =
                  value === undefined
                    ? 'No Data'
                    : formatDataValueByType({ value }, sanitizeValueType(valueType));

                return <MuiTableCell key={column}>{rowValue}</MuiTableCell>;
              })}
            </MuiTableRow>
          ))}
        </MuiTableBody>
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
  }),
  className: PropTypes.string,
};

Table.defaultProps = {
  viewContent: null,
  className: null,
};
