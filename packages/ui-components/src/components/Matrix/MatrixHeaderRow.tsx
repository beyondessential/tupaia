/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { TableCell, TableHead, TableRow } from '@material-ui/core';
import styled from 'styled-components';
import { MatrixContext } from './MatrixContext';

const HeaderCell = styled(TableCell)`
  text-align: center;
`;

export const MatrixHeaderRow = () => {
  const { columns } = useContext(MatrixContext);
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
