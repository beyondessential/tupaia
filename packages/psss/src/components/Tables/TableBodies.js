/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { TableBody, TableRow, tableColumnShape } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import * as COLORS from '../../theme/colors';

/*
 * Borderless Table Body
 */
const StyledRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 15px;
    line-height: 18px;
    border: none;
    padding: 0.8rem 1rem;
    text-align: left;
    height: auto;
    color: #414d55;
  }
`;

export const BorderlessTableBody = ({ data, rowIdKey, columns }) => (
  <TableBody StyledTableRow={StyledRow} data={data} rowIdKey={rowIdKey} columns={columns} />
);

BorderlessTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
};

/*
 * Dotted Table Body
 */

/*
 * Simple  Table Body
 */
