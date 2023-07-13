/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { MultiValueRowViewConfig } from '@tupaia/types';
import {
  Table,
  TableCell as MuiTableCell,
  TableRow,
  TableBody,
  TableHead,
} from '@material-ui/core';
import { ViewDataItem } from '../../types';

interface MultiValueRowProps {
  data?: ViewDataItem[];
  config: MultiValueRowViewConfig;
}

const TableCell = styled(MuiTableCell)`
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  line-height: 1.2;
  &:not(:first-child) {
    text-align: right;
  }
`;

const TableHeaderCell = styled(TableCell)`
  font-weight: normal;
  text-decoration: underline;
`;

export const MultiValueRow = ({ data, config }: MultiValueRowProps) => {
  const { presentationOptions = {} } = config;
  const { leftColumn, middleColumn, rightColumn, rowHeader } = presentationOptions;

  const headerCells = [leftColumn, middleColumn, rightColumn].filter(item => item);
  const showTableHeader = headerCells.length > 0 || rowHeader;

  return (
    <Table>
      {showTableHeader && (
        <TableHead>
          <TableRow>
            {rowHeader && <TableHeaderCell>{rowHeader.name}</TableHeaderCell>}
            {headerCells.map(cell => (
              <TableHeaderCell key={`header-${cell.header}`}>{cell.header}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {data?.map((datum, i) => (
          <TableRow key={datum.name}>
            <TableCell>{datum.name}</TableCell>
            {headerCells.map(cell => (
              <TableCell key={`row-${i}-cell-${cell.header}`}>{datum[cell.header]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
