/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Dispatch, ReactNode, createContext } from 'react';
import { MatrixConfig } from '@tupaia/types';
import { MatrixColumnType, MatrixRowType } from '../../types';

type RowTitle = MatrixRowType['title'];

const defaultContextValue = {
  rows: [],
  columns: [],
  expandedRows: [],
  enlargedCell: null,
  disableExpand: false,
} as Omit<MatrixConfig, 'type' | 'name'> & {
  rows: MatrixRowType[];
  columns: MatrixColumnType[];
  expandedRows: RowTitle[];
  enlargedCell: Record<string, any> | null;
  disableExpand?: boolean;
  rowHeaderColumnTitle?: ReactNode;
};

// This is the context for the rows, columns and presentation options of the matrix
export const MatrixContext = createContext(defaultContextValue);

export enum ACTION_TYPES {
  EXPAND_ROW = 'EXPAND_ROW',
  COLLAPSE_ROW = 'COLLAPSE_ROW',
  SET_ENLARGED_CELL = 'SET_ENLARGED_CELL',
}
interface MatrixAction {
  type: ACTION_TYPES;
  payload?: RowTitle | number | Record<string, any> | null;
}

// This is the context for the dispatch function of the matrix
export const MatrixDispatchContext = createContext<Dispatch<MatrixAction> | null>(null);

type MatrixReducerState = Pick<typeof defaultContextValue, 'expandedRows' | 'enlargedCell'>;

export const matrixReducer = (
  state: MatrixReducerState,
  action: MatrixAction,
): MatrixReducerState => {
  switch (action.type) {
    case ACTION_TYPES.EXPAND_ROW:
      return {
        ...state,
        expandedRows: [...state.expandedRows, action.payload as RowTitle],
      };
    case ACTION_TYPES.COLLAPSE_ROW:
      return {
        ...state,
        expandedRows: state.expandedRows.filter(
          (rowTitle: RowTitle) => rowTitle !== action.payload,
        ),
      };
    case ACTION_TYPES.SET_ENLARGED_CELL:
      return {
        ...state,
        enlargedCell: action.payload as Record<string, any> | null,
      };
    default:
      return state;
  }
};
