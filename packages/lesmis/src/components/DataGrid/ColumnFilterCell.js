/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { TableCell } from '@tupaia/ui-components';

const StyledTableCell = styled(TableCell)`
  padding: 18px 10px 18px 0;
  background: #f1f1f1;
`;

// eslint-disable-next-line react/prop-types
export const ColumnFilterCell = ({ column }) => {
  return (
    <StyledTableCell {...column.getHeaderProps()}>
      {column.canFilter ? column.render('Filter') : null}
    </StyledTableCell>
  );
};
