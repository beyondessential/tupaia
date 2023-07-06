/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { TableCell, TableHead, TableRow } from '@material-ui/core';
import styled from 'styled-components';
import { MatrixContext } from './MatrixContext';
import { MatrixColumnType } from '../../types';

const HeaderCell = styled(TableCell)`
  text-align: center;
  max-width: 12.5rem;
`;

export const MatrixHeaderRow = () => {
  const { columns, startColumn, maxColumns } = useContext(MatrixContext);

  const displayedColumns = columns.slice(
    startColumn,
    startColumn + maxColumns,
  ) as MatrixColumnType[];
  return (
    <TableHead>
      <TableRow>
        <TableCell />
        {displayedColumns.map(({ title }) => (
          <HeaderCell key={title}>{title}</HeaderCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
