/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import styled from 'styled-components';
import { ConditionalPresentationOptions } from '@tupaia/types';
import { MatrixColumnType, MatrixRowType } from '../../types';
import {
  checkIfApplyDotStyle,
  getFlattenedColumns,
  getIsUsingDots,
  getPresentationOption,
  getFullHex,
} from './utils';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
import { CellButton } from './CellButton';
import { Cell } from './Cell';

export const Dot = styled.div<{ $color?: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 0.375rem solid
    ${({ theme }) =>
      theme.palette.background.default === 'transparent'
        ? 'transparent'
        : `${getFullHex(theme.palette.background.default)}cc`};
  margin: 0 auto;
`;

const DataCell = styled(Cell)`
  vertical-align: middle;
  position: relative;
  z-index: 1;
  height: 100%;
`;

const DataCellContent = styled.div<{
  $characterLength: number;
}>`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  min-width: ${({ $characterLength = 0 }) =>
    $characterLength > 30
      ? '25ch'
      : '13ch'}; // Apply the min width to the content because the cell has padding and we want the content to have a min width and then the padding on top of that
`;

const ExpandButton = styled(Button)`
  &:hover {
    ${Dot} {
      transform: scale(1.2);
    }
  }
`;

interface MatrixCellProps {
  value: any;
  rowTitle: MatrixRowType['title'];
  isCategory?: boolean;
  colKey: MatrixColumnType['key'];
  onClick?: MatrixRowType['onClick'];
}

/**
 * This renders a cell in the matrix table. It can either be a category header cell or a data cell. If it has presentation options, it will be a button that can be clicked to expand the data. Otherwise, it will just display the data as normal
 */
export const MatrixCell = ({ value, rowTitle, isCategory, colKey, onClick }: MatrixCellProps) => {
  const {
    presentationOptions = {},
    categoryPresentationOptions = {},
    columns,
  } = useContext(MatrixContext);
  const dispatch = useContext(MatrixDispatchContext)!;
  // If the cell is a category, it means it is a category header cell and should use the category presentation options. Otherwise, it should use the normal presentation options

  const allColumns = getFlattenedColumns(columns);
  const colIndex = allColumns.findIndex(({ key }) => key === colKey);

  const presentationOptionsForCell = isCategory ? categoryPresentationOptions : presentationOptions;

  const isDots =
    getIsUsingDots(presentationOptionsForCell) &&
    checkIfApplyDotStyle(presentationOptionsForCell as ConditionalPresentationOptions, colIndex);
  const presentation = getPresentationOption(presentationOptionsForCell, value);

  const getDisplayValue = () => {
    if (isDots) {
      return (
        <Dot
          $color={presentation?.color}
          aria-label={`${presentation?.description ? `${presentation.description}: ` : ''}${
            value || 'No value'
          }`}
        />
      );
    }
    if (value === null || value === undefined) {
      return '—'; // em dash
    }
    return value;
  };
  const displayValue = getDisplayValue();

  const onClickCellButton = () => {
    dispatch({
      type: ACTION_TYPES.SET_ENLARGED_CELL,
      payload: {
        rowTitle,
        value,
        displayValue,
        presentation,
        isCategory,
        colKey,
      },
    });
  };

  // If the cell has an onClick, it should be a button. If isDots is true, it should be a button that can be clicked to open a modal. Otherwise, it should just be a normal cell.
  let CellComponent;
  if (onClick) {
    CellComponent = CellButton;
    // if no value, don't render as a button because it won't do anything
  } else if (isDots && value !== undefined) {
    CellComponent = ExpandButton;
  }

  const characterLength = isDots ? 0 : String(displayValue).length;
  return (
    <DataCell $characterLength={characterLength}>
      <DataCellContent
        $characterLength={characterLength}
        as={CellComponent}
        onClick={onClick || (isDots && value !== undefined) ? onClickCellButton : null}
      >
        {displayValue}
      </DataCellContent>
    </DataCell>
  );
};
