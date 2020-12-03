/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback } from 'react';
import MuiTableFooter from '@material-ui/core/TableFooter';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTablePagination from '@material-ui/core/TablePagination';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { tableColumnShape } from './tableColumnShape';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const TableFooter = styled(MuiTableFooter)`
  .MuiTableCell-footer {
    padding-top: 40px;
    border: none;
  }
`;

const TablePagination = styled(MuiTablePagination)`
  .MuiTablePagination-toolbar {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    color: ${props => props.theme.palette.text.secondary};
  }

  .MuiTablePagination-spacer {
    display: none;
  }

  .MuiTablePagination-input {
    justify-self: start;
  }

  .MuiTablePagination-actions {
    justify-self: end;
  }

  .MuiButtonBase-root {
    background-color: ${props => props.theme.palette.grey['200']};
    padding: 0.5rem;
    border-radius: 3px;

    &:last-child {
      margin-left: 0.5rem;
    }

    &:hover {
      background-color: ${props => props.theme.palette.primary.main};
      color: white;
    }
  }
`;

export const TablePaginator = React.memo(
  ({ columns, page, count, rowsPerPage, onChangePage, onChangeRowsPerPage }) => {
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

    if (count <= rowsPerPage) {
      return null;
    }

    return (
      <TableFooter>
        <MuiTableRow>
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            colSpan={columns.length}
            page={page}
            count={count}
            rowsPerPage={rowsPerPage}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </MuiTableRow>
      </TableFooter>
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
