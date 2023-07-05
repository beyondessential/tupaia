import { Dispatch, createContext } from 'react';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { PresentationOptions } from '@tupaia/types';

const defaultContext = {
  rows: [],
  columns: [],
  presentationOptions: {},
  startColumn: 0,
  numberOfColumnsPerPage: 0,
} as {
  rows: MatrixRowType[];
  columns: MatrixColumnType[];
  presentationOptions: PresentationOptions;
  startColumn: number;
  numberOfColumnsPerPage: number;
};
// This is the context for the rows, columns and presentation options of the matrix
export const MatrixContext = createContext(defaultContext);

interface SetStartColumnAction {
  type: 'INCREASE' | 'DECREASE';
}

export const MatrixStartColumnDispatchContext = createContext<Dispatch<SetStartColumnAction> | null>(
  null,
);

export const matrixStartColumnReducer = (startColumn: number, action: SetStartColumnAction) => {
  switch (action.type) {
    case 'INCREASE':
      return startColumn + 1;
    case 'DECREASE':
      return startColumn - 1;
    default:
      return startColumn;
  }
};

interface ExpandRowAction {
  type: 'EXPAND_ROW' | 'COLLAPSE_ROW';
  payload: MatrixRowType['title'];
}

// This is the context for the expanded rows of the matrix
export const MatrixExpandedRowsContext = createContext<MatrixRowType['title'][]>([]);
// This is the context for the dispatch function for the expanded rows of the matrix
export const MatrixExpandedRowsDispatchContext = createContext<Dispatch<ExpandRowAction> | null>(
  null,
);

export const matrixExpandedRowsReducer = (
  expandedRows: MatrixRowType['title'][],
  action: ExpandRowAction,
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
