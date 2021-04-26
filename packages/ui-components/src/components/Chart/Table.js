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
import { formatTimestampForChart, getIsTimeSeries } from './utils';

const StyledTable = styled(MuiTable)`
  // table head
  thead {
    text-transform: capitalize;

    tr {
      background: none;
    }

    th {
      position: relative;
      background: none;
      padding: 0;
      width: 200px;
      height: 200px;
      transform: rotate(-45deg);
      text-align: left;
      border: none;
      font-weight: 400;
    }
  }

  // table body
  tbody {
    th {
      font-weight: 500;
    }

    tr {
      &:nth-of-type(odd) {
        background: #f1f1f1;
      }
    }
  }

  th,
  td {
    padding-top: 18px;
    padding-bottom: 18px;
    color: ${props => props.theme.palette.text.primary};
    border: 1px solid ${props => props.theme.palette.grey['400']};

    &:first-child {
      border-left: none;
    }

    &:last-child {
      border-right: none;
    }
  }
`;

const getColumns = rawData => {
  const columns = [];
  rawData.forEach(row => {
    Object.keys(row)
      .filter(key => key !== 'name' && key !== 'timestamp')
      .forEach(key => {
        if (!columns.includes(key)) {
          columns.push(key);
        }
      });
  });

  return columns;
};

export const Table = ({ viewContent }) => {
  const { data, xName, periodGranularity, valueType, labelType } = viewContent;
  const valueTypeForLabel = labelType || valueType;
  const columns = getColumns(data);
  const dataIsTimeSeries = getIsTimeSeries(data) && periodGranularity;

  return (
    <MuiTableContainer>
      <StyledTable>
        <MuiTableHead>
          <MuiTableRow>
            <MuiTableCell width={200}>{xName || 'Name'}</MuiTableCell>
            {columns.map(column => (
              <MuiTableCell key={column}>{column}</MuiTableCell>
            ))}
          </MuiTableRow>
        </MuiTableHead>
        <MuiTableBody>
          {data.map(row => (
            <MuiTableRow key={row.timestamp}>
              <MuiTableCell component="th" scope="row">
                {dataIsTimeSeries
                  ? formatTimestampForChart(row.timestamp, periodGranularity)
                  : row.name}
              </MuiTableCell>
              {columns.map(column => {
                const value = row[column];
                const rowValue =
                  value === undefined ? ' -' : formatDataValueByType({ value }, valueTypeForLabel);

                return <MuiTableCell>{rowValue}</MuiTableCell>;
              })}
            </MuiTableRow>
          ))}
        </MuiTableBody>
      </StyledTable>
    </MuiTableContainer>
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
};

Table.defaultProps = {
  viewContent: null,
};
