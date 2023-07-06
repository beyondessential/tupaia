import { Dispatch, createContext } from 'react';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { PresentationOptions } from '@tupaia/types';

type RowTitle = MatrixRowType['title'];

const defaultContextValue = {
  rows: [],
  columns: [],
  presentationOptions: {},
  startColumn: 0,
  maxColumns: 0,
  expandedRows: [],
} as {
  rows: MatrixRowType[];
  columns: MatrixColumnType[];
  presentationOptions: PresentationOptions;
  startColumn: number;
  maxColumns: number;
  expandedRows: RowTitle[];
};

// This is the context for the rows, columns and presentation options of the matrix
export const MatrixContext = createContext(defaultContextValue);

interface MatrixAction {
  type:
    | 'EXPAND_ROW'
    | 'COLLAPSE_ROW'
    | 'INCREASE_START_COLUMN'
    | 'DECREASE_START_COLUMN'
    | 'SET_MAX_COLUMNS';
  payload: RowTitle | number | undefined;
}

// This is the context for the dispatch function of the matrix
export const MatrixDispatchContext = createContext<Dispatch<MatrixAction> | null>(null);

type MatrixReducerState = Pick<
  typeof defaultContextValue,
  'startColumn' | 'expandedRows' | 'maxColumns'
>;

export const matrixReducer = (
  state: MatrixReducerState,
  action: MatrixAction,
): MatrixReducerState => {
  switch (action.type) {
    case 'EXPAND_ROW':
      return {
        ...state,
        expandedRows: [...state.expandedRows, action.payload as RowTitle],
      };
    case 'COLLAPSE_ROW':
      return {
        ...state,
        expandedRows: state.expandedRows.filter(
          (rowTitle: RowTitle) => rowTitle !== action.payload,
        ),
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
    case 'SET_MAX_COLUMNS':
      return {
        ...state,
        maxColumns: action.payload as number,
      };
    default:
      return state;
  }
};
