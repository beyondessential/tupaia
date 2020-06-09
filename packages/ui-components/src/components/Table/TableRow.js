/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiTableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import MuiTableRow from '@material-ui/core/TableRow';
import { tableColumnShape } from './tableColumnShape';

export const TableCell = styled(MuiTableCell)`
  height: 70px;
  padding: 0.4rem 0;
  font-size: 0.9375rem;
  line-height: 1rem;
  min-width: 4rem;
  color: ${props => props.theme.palette.text.secondary};

  &:first-child {
    padding-left: 1.25rem;
  }
`;

export const TableRowCells = React.memo(({ columns, rowData }) =>
  columns.map(({ key, accessor, CellComponent, width = null, align = 'center', cellColor }) => {
    const value = accessor ? accessor(rowData) : rowData[key];
    const displayValue = value === 0 ? '0' : value;
    const backgroundColor = typeof cellColor === 'function' ? cellColor(rowData) : cellColor;
    return (
      <TableCell background={backgroundColor} key={key} style={{ width: width }} align={align}>
        {CellComponent ? (
          <CellComponent {...rowData} displayValue={displayValue} columnKey={key} />
        ) : (
          displayValue
        )}
      </TableCell>
    );
  }),
);

TableRowCells.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
};

const rowHoverColor = '#F1F1F1';

export const StyledTableRow = styled(MuiTableRow)`
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  &:hover {
    background: ${rowHoverColor};
  }
`;

export const TableRow = React.memo(({ columns, data, rowIndex, className }) => (
  <StyledTableRow className={className}>
    <TableRowCells columns={columns} rowData={data[rowIndex]} />
  </StyledTableRow>
));

TableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  rowIndex: PropTypes.number.isRequired,
};

TableRow.defaultProps = {
  className: '',
};

const condensedRowBackgroundColor = '#EFEFEF';

export const CondensedTableRow = styled(TableRow)`
  &:nth-of-type(even) {
    background: ${condensedRowBackgroundColor};

    &:hover {
      background: ${condensedRowBackgroundColor};
    }
  }

  .MuiTableCell-root {
    border: none;
  }
`;
