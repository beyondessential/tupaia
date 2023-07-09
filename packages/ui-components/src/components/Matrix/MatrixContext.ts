/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Dispatch, createContext } from 'react';
import { PresentationOptions } from '@tupaia/types';
import { MatrixColumnType, MatrixRowType } from '../../types';

type RowTitle = MatrixRowType['title'];

const defaultContextValue = {
  rows: [],
  columns: [],
  presentationOptions: {},
  startColumn: 0,
  maxColumns: 0,
  expandedRows: [],
  enlargedCell: null,
  categoryPresentationOptions: {},
} as {
  rows: MatrixRowType[];
  columns: MatrixColumnType[];
  presentationOptions?: PresentationOptions;
  categoryPresentationOptions?: PresentationOptions;
  startColumn: number;
  maxColumns: number;
  expandedRows: RowTitle[];
  enlargedCell: Record<string, any> | null;
};

// This is the context for the rows, columns and presentation options of the matrix
export const MatrixContext = createContext(defaultContextValue);

export enum ACTION_TYPES {
  EXPAND_ROW = 'EXPAND_ROW',
  COLLAPSE_ROW = 'COLLAPSE_ROW',
  INCREASE_START_COLUMN = 'INCREASE_START_COLUMN',
  DECREASE_START_COLUMN = 'DECREASE_START_COLUMN',
  SET_MAX_COLUMNS = 'SET_MAX_COLUMNS',
  SET_ENLARGED_CELL = 'SET_ENLARGED_CELL',
}
interface MatrixAction {
  type: ACTION_TYPES;
  payload?: RowTitle | number | Record<string, any> | null;
}

// This is the context for the dispatch function of the matrix
export const MatrixDispatchContext = createContext<Dispatch<MatrixAction> | null>(null);

type MatrixReducerState = Pick<
  typeof defaultContextValue,
  'startColumn' | 'expandedRows' | 'maxColumns' | 'enlargedCell'
>;

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
    case ACTION_TYPES.INCREASE_START_COLUMN:
      return {
        ...state,
        startColumn: state.startColumn + 1,
      };
    case ACTION_TYPES.DECREASE_START_COLUMN:
      return {
        ...state,
        startColumn: state.startColumn - 1,
      };
    case ACTION_TYPES.SET_MAX_COLUMNS:
      return {
        ...state,
        maxColumns: action.payload as number,
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
