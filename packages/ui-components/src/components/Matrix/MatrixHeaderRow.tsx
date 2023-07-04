/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TableCell, TableHead, TableRow } from '@material-ui/core';
import styled from 'styled-components';

const HeaderCell = styled(TableCell)`
  text-align: center;
`;
interface MatrixHeaderRowProps {
  columns: {
    title: string;
  }[];
}
export const MatrixHeaderRow = ({ columns }: MatrixHeaderRowProps) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell />
        {columns.map(({ title }) => (
          <HeaderCell key={title}>{title}</HeaderCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
