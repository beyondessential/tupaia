import { Dispatch, createContext } from 'react';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { PresentationOptions } from '@tupaia/types';

const defaultContext = {
  rows: [],
  columns: [],
  presentationOptions: {},
} as {
  rows: MatrixRowType[];
  columns: MatrixColumnType[];
  presentationOptions: PresentationOptions;
};
// This is the context for the rows, columns and presentation options of the matrix
export const MatrixContext = createContext(defaultContext);

// This is the context for the expanded rows of the matrix
export const MatrixExpandedRowsContext = createContext<MatrixRowType['title'][]>([]);
// This is the context for the dispatch function for the expanded rows of the matrix
export const MatrixExpandedRowsDispatchContext = createContext<Dispatch<Action> | null>(null);

interface Action {
  type: 'EXPAND_ROW' | 'COLLAPSE_ROW';
  payload: MatrixRowType['title'];
}
export const matrixExpandedRowsReducer = (
  expandedRows: MatrixRowType['title'][],
  action: Action,
) => {
  switch (action.type) {
    case 'EXPAND_ROW':
      return [...expandedRows, action.payload];
    case 'COLLAPSE_ROW':
      return expandedRows.filter(rowTitle => rowTitle !== action.payload);
    default:
      return expandedRows;
  }
};
