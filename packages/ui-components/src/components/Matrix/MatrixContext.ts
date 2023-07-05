import { Dispatch, createContext } from 'react';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { PresentationOptions } from '@tupaia/types';

const defaultContextValue = {
  rows: [],
  columns: [],
  presentationOptions: {},
  startColumn: 0,
  numberOfColumnsPerPage: 0,
  expandedRows: [],
} as {
  rows: MatrixRowType[];
  columns: MatrixColumnType[];
  presentationOptions: PresentationOptions;
  startColumn: number;
  numberOfColumnsPerPage: number;
  expandedRows: MatrixRowType['title'][];
};

// This is the context for the rows, columns and presentation options of the matrix
export const MatrixContext = createContext(defaultContextValue);

interface MatrixAction {
  type: 'EXPAND_ROW' | 'COLLAPSE_ROW' | 'INCREASE_START_COLUMN' | 'DECREASE_START_COLUMN';
  payload: MatrixRowType['title'] | undefined;
}

// This is the context for the dispatch function of the matrix
export const MatrixDispatchContext = createContext<Dispatch<MatrixAction> | null>(null);

type MatrixReducerState = Pick<typeof defaultContextValue, 'startColumn' | 'expandedRows'>;

export const matrixReducer = (
  state: MatrixReducerState,
  action: MatrixAction,
): MatrixReducerState => {
  switch (action.type) {
    case 'EXPAND_ROW':
      return {
        ...state,
        expandedRows: [...state.expandedRows, action.payload!],
      };
    case 'COLLAPSE_ROW':
      return {
        ...state,
        expandedRows: state.expandedRows.filter(row => row !== action.payload),
      };
    case 'INCREASE_START_COLUMN':
      return {
        ...state,
        startColumn: state.startColumn + 1,
      };
    case 'DECREASE_START_COLUMN':
      return {
        ...state,
        startColumn: state.startColumn - 1,
      };
    default:
      return state;
  }
};
