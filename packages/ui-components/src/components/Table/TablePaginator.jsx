import React, { useCallback } from 'react';
import MuiTableFooter from '@material-ui/core/TableFooter';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTablePagination from '@material-ui/core/TablePagination';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { tableColumnShape } from './tableColumnShape';

export const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const TableFooter = styled(MuiTableFooter)`
  .MuiTableCell-footer.MuiTablePagination-root {
    padding-top: 40px;
    padding-right: 0;
    border: none;
  }
`;

const TablePagination = styled(MuiTablePagination)`
  pointer-events: ${props => (props.disabled ? 'none' : 'inherit')};

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
    color: ${props => (props.disabled ? props.theme.palette.text.secondary : 'inherit')};

    &:last-child {
      margin-left: 0.5rem;
    }

    &:hover {
      background-color: ${props =>
        props.disabled ? props.theme.palette.grey['200'] : props.theme.palette.primary.main};
      color: ${props => (props.disabled ? props.theme.palette.text.tertiary : 'white')};
    }
  }
`;

export const TablePaginator = React.memo(
  ({
    columns,
    page,
    count,
    rowsPerPage,
    rowsPerPageOptions,
    onChangePage,
    onChangeRowsPerPage,
    isFetching,
  }) => {
    if (count <= rowsPerPage) return null;

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
      <TableFooter>
        <MuiTableRow>
          <TablePagination
            disabled={isFetching}
            rowsPerPageOptions={rowsPerPageOptions}
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
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  isFetching: PropTypes.bool,
};

TablePaginator.defaultProps = {
  count: 0,
  onChangePage: null,
  onChangeRowsPerPage: null,
  page: null,
  rowsPerPage: 10,
  rowsPerPageOptions: DEFAULT_ROWS_PER_PAGE_OPTIONS,
  isFetching: false,
};
