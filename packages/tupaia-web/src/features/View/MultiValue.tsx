/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Table, TableCell as MuiTableCell, TableRow, TableBody } from '@material-ui/core';
import { ViewDataItem } from '../../types';

interface MultiValueProps {
  data?: (Omit<ViewDataItem, 'value'> & {
    value: string | number | Element;
  })[];
}

const TableCell = styled(MuiTableCell)`
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  line-height: 1.2;
  &:nth-child(2) {
    color: ${({ theme }) => theme.dashboardItem.multiValue.data};
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    text-align: right;
  }
`;

export const MultiValue = ({ data }: MultiValueProps) => {
  return (
    <Table>
      <TableBody>
        {data?.map((datum, i) => (
          <TableRow key={i}>
            <TableCell component="th">{datum.name}</TableCell>
            <TableCell>{datum.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
