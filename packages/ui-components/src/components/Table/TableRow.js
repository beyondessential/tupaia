/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import MuiTableCell from '@material-ui/core/TableCell';
import React, { useCallback, useState } from 'react';
import MuiTable from '@material-ui/core/Table';
import PropTypes from 'prop-types';
import MuiTableRow from '@material-ui/core/TableRow';

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

const TableRowCells = React.memo(({ columns, rowData }) =>
  columns.map(({ key, accessor, CellComponent, width = null, align = 'center', cellColor }) => {
    const value = accessor ? React.createElement(accessor, rowData) : rowData[key];
    const displayValue = value === 0 ? '0' : value;
    const backgroundColor = typeof cellColor === 'function' ? cellColor(rowData) : cellColor;
    return (
      <TableCell background={backgroundColor} key={key} style={{ width: width }} align={align}>
        {CellComponent ? <CellComponent {...rowData} /> : displayValue}
      </TableCell>
    );
  }),
);

const tableColumnShape = {
  key: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  accessor: PropTypes.func,
  CellComponent: PropTypes.any,
  sortable: PropTypes.bool,
};

TableRowCells.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
};

const NestedTableWrapperCell = styled.td`
  background: white;
  padding: 0;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  box-sizing: border-box;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);

  .MuiTableRow-root {
    &:hover {
      background: ${props => props.theme.palette.common.white};
    }
  }
`;

export const StyledTable = styled(MuiTable)`
  border-collapse: unset;
  table-layout: fixed;
`;

const NestedTable = React.memo(({ row, children, columns }) => (
  <MuiTableRow>
    <NestedTableWrapperCell colSpan={columns.length}>
      <StyledTable>
        <tbody>{row}</tbody>
      </StyledTable>
      {children}
    </NestedTableWrapperCell>
  </MuiTableRow>
));

NestedTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  row: PropTypes.any.isRequired,
  children: PropTypes.any,
};

NestedTable.defaultProps = {
  children: PropTypes.null,
};

const rowHoverColor = '#F1F1F1';

export const StyledTableRow = styled(MuiTableRow)`
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  &:hover {
    background: ${rowHoverColor};
  }
`;

const condensedRowBackgroundColor = '#EFEFEF';

const CondensedStyleTableRow = styled(MuiTableRow)`
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

export const TableRow = React.memo(({ columns, rowData, variant }) => {
  const RowType = variant === 'condensed' ? CondensedStyleTableRow : StyledTableRow;
  return (
    <RowType>
      <TableRowCells columns={columns} rowData={rowData} />
    </RowType>
  );
});

TableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['standard', 'condensed']),
};

TableRow.defaultProps = {
  variant: 'standard',
};

export const ExpandableTableRow = React.memo(({ columns, rowData, SubComponent }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = useCallback(() => {
    setExpanded(prevExpanded => !prevExpanded);
  }, []);

  const row = (
    <StyledTableRow onClick={handleClick}>
      <TableRowCells columns={columns} rowData={rowData} />
    </StyledTableRow>
  );

  if (SubComponent && expanded) {
    return (
      <NestedTable row={row} columns={columns}>
        <SubComponent rowData={rowData} />
      </NestedTable>
    );
  }

  return row;
});

ExpandableTableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
  SubComponent: PropTypes.any,
};

ExpandableTableRow.defaultProps = {
  SubComponent: PropTypes.null,
};
