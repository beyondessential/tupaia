import {
  UseExpandedOptions,
  UseSortByColumnProps,
  UseSortByOptions,
  UseSortByState,
} from 'react-table';

type RowT = Record<string, any> & {
  url?: string;
};

declare module 'react-table' {
  export interface TableOptions<D extends Record<string, any>>
    extends UseExpandedOptions<D>,
      UseSortByOptions<D>,
      UsePaginationOptions<D>,
      // note that having Record here allows you to add anything to the options, this matches the spirit of the
      // underlying js library, but might be cleaner if it's replaced by a more specific type that matches your
      // feature set, this is a safe default.
      Record<string, any> {}

  export interface TableState<D extends Record<string, any>>
    extends UseSortByState<D>,
      UsePaginationState<D> {}

  export interface ColumnInstance<D extends Record<string, any>>
    extends UseSortByColumnProps<D>,
      UseResizeColumnsColumnProps<D> {
    filterable?: boolean;
    disableSortBy?: boolean;
  }
}
