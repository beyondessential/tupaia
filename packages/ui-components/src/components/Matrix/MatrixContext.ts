import { Dispatch, ReactNode, createContext } from 'react';
import { MatrixConfig, MatrixReportRow } from '@tupaia/types';
import { MatrixColumnType, MatrixRowType } from '../../types';

type RowTitle = MatrixRowType['title'];

export type SearchFilter = {
  key: keyof MatrixReportRow;
  value: string;
};

export type MatrixProps = Omit<MatrixConfig, 'type' | 'name'> & {
  rows: MatrixRowType[];
  columns: MatrixColumnType[];
  disableExpand?: boolean;
  rowHeaderColumnTitle?: ReactNode;
  enableSearch?: boolean;
  searchFilters?: SearchFilter[];
  updateSearchFilter?: (searchFilter: SearchFilter) => void;
  clearSearchFilter?: (key: SearchFilter['key']) => void;
};

export type MatrixContextT = MatrixProps & {
  expandedRows: RowTitle[];
};

const defaultContextValue = {
  rows: [],
  columns: [],
  expandedRows: [],
  disableExpand: false,
  enableSearch: true,
} as MatrixContextT;

// This is the context for the rows, columns and presentation options of the matrix
export const MatrixContext = createContext(defaultContextValue);

export enum ACTION_TYPES {
  EXPAND_ROW = 'EXPAND_ROW',
  COLLAPSE_ROW = 'COLLAPSE_ROW',
}
interface MatrixAction {
  type: ACTION_TYPES;
  payload?: RowTitle | number | null;
}

// This is the context for the dispatch function of the matrix
export const MatrixDispatchContext = createContext<Dispatch<MatrixAction> | null>(null);

type MatrixReducerState = Pick<typeof defaultContextValue, 'expandedRows'>;

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
    default:
      return state;
  }
};
