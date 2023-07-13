/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Table, TableCell as MuiTableCell, TableRow, TableBody } from '@material-ui/core';
import { ViewConfig } from '@tupaia/types';
import { ViewDataItem } from '../../types';

interface MultiValueProps {
  data?: ViewDataItem[];
  config?: ViewConfig;
}

const TableCell = styled(MuiTableCell)`
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  &:nth-child(2) {
    color: ${({ theme }) => theme.dashboardItem.multiValue.data};
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  }
`;

export const MultiValue = ({ data, config }: MultiValueProps) => {
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
