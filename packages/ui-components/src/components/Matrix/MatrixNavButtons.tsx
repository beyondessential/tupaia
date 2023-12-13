/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { Button } from '../Button';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
import { getFlattenedColumns } from './utils';

const TableMoveButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
  user-select: none; // prevents the table from being selected when quickly clicking the nav buttons
`;

const TableMoveButton = styled(Button).attrs({
  color: 'default',
  variant: 'outlined',
})`
  text-transform: none;
  font-size: 0.875rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem; // to compensate for left arrow
  background-color: transparent;
  border-color: transparent;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.palette.text.primary};
  &:disabled {
    background-color: transparent;
    opacity: 0.6;
    border-color: transparent;
  }
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.palette.primary.main};
  }
  &:last-child {
    padding: 0.5rem 0.5rem 0.5rem 1rem; // to compensate for right arrow
    margin-left: 0;
  }
`;

/**
 * Renders the buttons to move the columns left and right
 */
export const MatrixNavButtons = () => {
  const { startColumn, maxColumns, columns } = useContext(MatrixContext);
  // Get all of the flattened columns
  const childColumns = getFlattenedColumns(columns);
  const dispatch = useContext(MatrixDispatchContext)!;
  // Show the buttons when there are more columns than the max columns
  const showButtons = childColumns.length > maxColumns;

  const handleMoveColumnLeft = () => {
    dispatch({ type: ACTION_TYPES.DECREASE_START_COLUMN });
  };

  const handleMoveColumnRight = () => {
    dispatch({ type: ACTION_TYPES.INCREASE_START_COLUMN });
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
        disabled={startColumn >= childColumns.length - maxColumns}
        onClick={handleMoveColumnRight}
        title="Show next columns"
      >
        Next
        <KeyboardArrowRight />
      </TableMoveButton>
    </TableMoveButtonWrapper>
  );
};
