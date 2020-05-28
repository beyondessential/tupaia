/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTable from '@material-ui/core/Table';
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

const TableRowCells = React.memo(({ columns, rowData }) =>
  columns.map(({ key, accessor, CellComponent, width = null, align = 'center', cellColor }) => {
    const value = accessor ? accessor(rowData) : rowData[key];
    const displayValue = value === 0 ? '0' : value;
    const backgroundColor = typeof cellColor === 'function' ? cellColor(rowData) : cellColor;
    return (
      <TableCell background={backgroundColor} key={key} style={{ width: width }} align={align}>
        {CellComponent ? (
          <CellComponent {...rowData} displayValue={displayValue} columnKey={key} key={key} />
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

const WrapperCell = styled(MuiTableCell)`
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

const StyledTable = styled(MuiTable)`
  border-collapse: unset;
  table-layout: fixed;
`;

export const TableRowExpansionContainer = React.memo(
  ({ parentRow, children, colSpan, className }) => (
    <MuiTableRow className={className}>
      <WrapperCell colSpan={colSpan}>
        <StyledTable>
          <MuiTableBody>{parentRow}</MuiTableBody>
        </StyledTable>
        {children}
      </WrapperCell>
    </MuiTableRow>
  ),
);

TableRowExpansionContainer.propTypes = {
  colSpan: PropTypes.number.isRequired,
  parentRow: PropTypes.any.isRequired,
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
};

TableRowExpansionContainer.defaultProps = {
  className: '',
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

export const ExpandableTableRow = React.memo(
  ({ columns, data, rowIndex, className, SubComponent, defaultExpanded }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleClick = useCallback(() => {
      setExpanded(prevExpanded => !prevExpanded);
    }, []);

    const row = (
      <StyledTableRow className={className} onClick={handleClick}>
        <TableRowCells columns={columns} rowData={data[rowIndex]} />
      </StyledTableRow>
    );

    if (SubComponent && expanded) {
      return (
        <TableRowExpansionContainer parentRow={row} colSpan={columns.length}>
          <SubComponent data={data} />
        </TableRowExpansionContainer>
      );
    }

    return row;
  },
);

ExpandableTableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
  SubComponent: PropTypes.any,
  className: PropTypes.string,
  defaultExpanded: PropTypes.bool,
};

ExpandableTableRow.defaultProps = {
  SubComponent: PropTypes.null,
  defaultExpanded: false,
  className: '',
};

export const ControlledExpandableTableRow = ({
  columns,
  data,
  rowIndex,
  className,
  expanded,
  onClick,
  SubComponent,
  ExpansionContainer,
}) => {
  const row = (
    <StyledTableRow className={className} onClick={onClick}>
      <TableRowCells columns={columns} rowData={data[rowIndex]} />
    </StyledTableRow>
  );

  if (SubComponent && expanded) {
    return (
      <ExpansionContainer parentRow={row} colSpan={columns.length}>
        <SubComponent data={data} />
      </ExpansionContainer>
    );
  }

  return row;
};

ControlledExpandableTableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  SubComponent: PropTypes.any,
  ExpansionContainer: PropTypes.any,
};

ControlledExpandableTableRow.defaultProps = {
  className: '',
  expanded: false,
  SubComponent: PropTypes.null,
  ExpansionContainer: TableRowExpansionContainer,
};
