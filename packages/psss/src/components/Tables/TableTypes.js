/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Table, TableBody, TableRow, tableColumnShape } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import * as COLORS from '../../theme/colors';

/*
 * Borderless Table Body
 */
const BorderlessTableRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 15px;
    line-height: 18px;
    border: none;
    padding: 0 1rem;
    text-align: left;
    height: 42px;
    color: ${props => props.theme.palette.text.primary};
  }
`;

const BorderlessTableBody = ({ data, rowIdKey, columns }) => (
  <TableBody
    StyledTableRow={BorderlessTableRow}
    data={data}
    rowIdKey={rowIdKey}
    columns={columns}
  />
);

BorderlessTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
};

export const BorderlessTable = ({ columns, data }) => {
  return <Table Header={false} Body={BorderlessTableBody} columns={columns} data={data} />;
};

BorderlessTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};

/*
 * Dotted Table Body
 */
const DottedTableRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 14px;
    line-height: 16px;
    padding: 0.8rem 1rem;
    border-bottom: 1px dashed ${COLORS.GREY_DE};
    color: ${props => props.theme.palette.text.primary};
    text-align: left;
    height: auto;
  }
`;

const DottedTableBody = ({ data, rowIdKey, columns }) => (
  <TableBody StyledTableRow={DottedTableRow} data={data} rowIdKey={rowIdKey} columns={columns} />
);

DottedTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
};

export const DottedTable = ({ columns, data }) => {
  return <Table Header={false} Body={DottedTableBody} columns={columns} data={data} />;
};

DottedTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};

/*
 * Simple  Table Body
 */
const SimpleTableRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 14px;
    line-height: 16px;
    border-bottom: 1px solid ${COLORS.GREY_DE};
    padding: 0.8rem 1rem;
    text-align: left;
    height: auto;
    color: ${props => props.theme.palette.text.primary};
  }
`;

const SimpleTableBody = ({ data, rowIdKey, columns }) => (
  <TableBody StyledTableRow={SimpleTableRow} data={data} rowIdKey={rowIdKey} columns={columns} />
);

SimpleTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
};

export const SimpleTable = ({ columns, data }) => {
  return <Table Header={false} Body={SimpleTableBody} columns={columns} data={data} />;
};

SimpleTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};
