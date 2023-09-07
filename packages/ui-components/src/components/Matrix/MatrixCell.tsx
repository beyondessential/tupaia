/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { TableCell, Button } from '@material-ui/core';
import styled from 'styled-components';
import { ConditionalPresentationOptions } from '@tupaia/types';
import {
  checkIfApplyDotStyle,
  getFlattenedColumns,
  getIsUsingDots,
  getPresentationOption,
  getFullHex,
} from './utils';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { CellLink } from './CellLink';

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

const DataCell = styled(TableCell)`
  vertical-align: middle;
  position: relative;
  z-index: 1;
  padding: 0;
  height: 100%;
  border: 1px solid ${({ theme }) => getFullHex(theme.palette.text.primary)}33;
  word-break: break-word;
`;

const DataCellContent = styled.div`
  padding: 0.25rem;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
`;

const ExpandButton = styled(Button)`
  &:hover {
    ${Dot} {
      transform: scale(1.2);
    }
  }
`;

interface MatrixRowProps {
  value: any;
  rowTitle: MatrixRowType['title'];
  isCategory?: boolean;
  colKey: MatrixColumnType['key'];
  link?: MatrixRowType['link'];
}

/**
 * This renders a cell in the matrix table. It can either be a category header cell or a data cell. If it has presentation options, it will be a button that can be clicked to expand the data. Otherwise, it will just display the data as normal
 */
export const MatrixCell = ({ value, rowTitle, isCategory, colKey, link }: MatrixRowProps) => {
  const { presentationOptions = {}, categoryPresentationOptions = {}, columns } = useContext(
    MatrixContext,
  );
  const dispatch = useContext(MatrixDispatchContext)!;
  // If the cell is a category, it means it is a category header cell and should use the category presentation options. Otherwise, it should use the normal presentation options

  const allColumns = getFlattenedColumns(columns);
  const colIndex = allColumns.findIndex(({ key }) => key === colKey);

  const presentationOptionsForCell = isCategory ? categoryPresentationOptions : presentationOptions;
  const isDots =
    getIsUsingDots(presentationOptionsForCell) &&
    checkIfApplyDotStyle(presentationOptionsForCell as ConditionalPresentationOptions, colIndex);
  const presentation = getPresentationOption(presentationOptionsForCell, value);
  const displayValue = isDots ? (
    <Dot
      $color={presentation?.color}
      aria-label={`${presentation?.description ? `${presentation.description}: ` : ''}${
        value || 'No value'
      }`}
    />
  ) : (
    value
  );

  const onClickCellButton = () => {
    dispatch({
      type: ACTION_TYPES.SET_ENLARGED_CELL,
      payload: {
        rowTitle,
        value,
        displayValue,
        presentation,
        isCategory,
      },
    });
  };

  // If the cell has a link, it should be a link to another page. If isDots is true, it should be a button that can be clicked to open a modal. Otherwise, it should just be a normal cell.
  let CellComponent;
  if (link) {
    CellComponent = CellLink;
  } else if (isDots) {
    CellComponent = ExpandButton;
  }
  return (
    <DataCell>
      <DataCellContent
        as={CellComponent}
        onClick={isDots && value !== undefined ? onClickCellButton : null}
        to={link}
      >
        {displayValue}
      </DataCellContent>
    </DataCell>
  );
};
