/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { formatDataValueByType } from '@tupaia/utils';
import { formatTimestampForChart } from './utils';
import { Table as TableComponent } from '../Table';

export const Table = ({ viewContent }) => {
  const { data, xName, yName, periodGranularity, valueType } = viewContent;

  return (
    <MuiTable>
      <TableHead>
        <TableRow>
          <TableCell>{xName}</TableCell>
          <TableCell align="right">{yName}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.timestamp}>
            <TableCell component="th" scope="row">
              {formatTimestampForChart(row.timestamp, periodGranularity)}
            </TableCell>
            <TableCell align="right">
              {formatDataValueByType({ value: row.value }, valueType)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </MuiTable>
  );
};

Table.propTypes = {
  viewContent: PropTypes.shape({
    name: PropTypes.string,
    xName: PropTypes.string,
    yName: PropTypes.string,
    periodGranularity: PropTypes.string,
    valueType: PropTypes.string,
    chartType: PropTypes.string,
    data: PropTypes.array,
  }),
};

Table.defaultProps = {
  viewContent: null,
};

const columns = [
  {
    title: 'Timestamp',
    key: 'timestamp',
  },
  {
    title: 'Value',
    key: 'value',
  },
];

export const Table2 = ({ viewContent }) => {
  const { data } = viewContent;

  return <TableComponent data={data} columns={columns} />;
};

Table2.propTypes = {
  viewContent: PropTypes.shape({
    name: PropTypes.string,
    xName: PropTypes.string,
    yName: PropTypes.string,
    periodGranularity: PropTypes.string,
    valueType: PropTypes.string,
    chartType: PropTypes.string,
    data: PropTypes.array,
  }),
};

Table2.defaultProps = {
  viewContent: null,
};
