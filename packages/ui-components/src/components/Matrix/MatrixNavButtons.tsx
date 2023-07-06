/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { Button } from '../Button';
import { MatrixContext, MatrixDispatchContext } from './MatrixContext';

const TableMoveButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const TableMoveButton = styled(Button).attrs({
  color: 'default',
  variant: 'outlined',
})`
  text-transform: none;
  font-size: 0.875rem;
  background-color: transparent;
  border-color: transparent;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.palette.text.primary};
  &:disabled {
    background-color: transparent;
    opacity: 0.6;
  }
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

export const MatrixNavButtons = () => {
  const { startColumn, columns, maxColumns } = useContext(MatrixContext);
  const dispatch = useContext(MatrixDispatchContext)!;
  // Show the previous button when the first column is not visible
  const showButtons = columns.length > maxColumns;

  const handleMoveColumnLeft = () => {
    dispatch({ type: 'DECREASE_START_COLUMN' });
  };

  const handleMoveColumnRight = () => {
    dispatch({ type: 'INCREASE_START_COLUMN' });
  };

  if (!showButtons) return null;

  return (
    <TableMoveButtonWrapper>
      <TableMoveButton
        disabled={startColumn === 0}
        onClick={handleMoveColumnLeft}
        title="Show previous columns"
      >
        <KeyboardArrowLeft />
        Previous
      </TableMoveButton>
      <TableMoveButton
        disabled={startColumn >= columns.length - maxColumns}
        onClick={handleMoveColumnRight}
        title="Show next columns"
      >
        Next
        <KeyboardArrowRight />
      </TableMoveButton>
    </TableMoveButtonWrapper>
  );
};
