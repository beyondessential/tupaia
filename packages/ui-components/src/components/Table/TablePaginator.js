/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback } from 'react';
import MuiTableFooter from '@material-ui/core/TableFooter';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTablePagination from '@material-ui/core/TablePagination';
import PropTypes from 'prop-types';
import { tableColumnShape } from './tableColumnShape';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export const TablePaginator = React.memo(
  ({ columns, page, count, rowsPerPage, onChangePage, onChangeRowsPerPage }) => {
    if (count <= rowsPerPage) {
      return null;
    }

    const handleChangePage = useCallback(
      (event, newPage) => {
        if (onChangePage) onChangePage(newPage);
      },
      [onChangePage],
    );

    const handleChangeRowsPerPage = useCallback(
      event => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        if (onChangeRowsPerPage) onChangeRowsPerPage(newRowsPerPage);
      },
      [onChangeRowsPerPage],
    );

    return (
      <MuiTableFooter>
        <MuiTableRow>
          <MuiTablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            colSpan={columns.length}
            page={page}
            count={count}
            rowsPerPage={rowsPerPage}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </MuiTableRow>
      </MuiTableFooter>
    );
  },
);

TablePaginator.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  count: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};

TablePaginator.defaultProps = {
  count: 0,
  onChangePage: null,
  onChangeRowsPerPage: null,
  page: null,
  rowsPerPage: 10,
};
