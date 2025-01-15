import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTable from '@material-ui/core/Table';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import { AddCircle, RemoveCircle } from '@material-ui/icons';
import { tableColumnShape } from './tableColumnShape';
import { TableRowCells, StyledTableRow } from './TableRow';
import { IconButton } from '../IconButton';

const WrapperCell = styled(MuiTableCell)`
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  box-sizing: border-box;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);

  &.MuiTableCell-root.MuiTableCell-body {
    padding: 0;
  }

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

const PositionedIconButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 0;
`;

const OpenIcon = styled(AddCircle)`
  color: ${props => props.theme.palette.text.tertiary};
`;

const CloseIcon = styled(RemoveCircle)`
  color: ${props => props.theme.palette.text.primary};
`;

const DefaultExpandButton = ({ onClick, expanded }) => (
  <PositionedIconButton onClick={onClick}>
    {expanded ? <CloseIcon /> : <OpenIcon />}
  </PositionedIconButton>
);

DefaultExpandButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};

export const ExpandableTableRow = React.memo(
  ({
    columns,
    rowData,
    className,
    expandedValue,
    SubComponent,
    ExpansionContainer,
    onClick,
    ExpandButtonComponent,
  }) => {
    const isControlled = expandedValue !== undefined;
    const [expandedState, setExpandedState] = useState(false);
    const expanded = isControlled ? expandedValue : expandedState;

    const handleClick = useCallback(() => {
      if (!isControlled) {
        setExpandedState(prevExpanded => !prevExpanded);
      } else if (onClick) {
        onClick();
      }
    }, [setExpandedState, onClick, isControlled]);

    const row = (
      <StyledTableRow className={className}>
        <TableRowCells
          columns={columns}
          rowData={rowData}
          ExpandButton={
            ExpandButtonComponent && (
              <ExpandButtonComponent onClick={handleClick} expanded={expanded} />
            )
          }
        />
      </StyledTableRow>
    );

    if (SubComponent && expanded) {
      return (
        <ExpansionContainer parentRow={row} colSpan={columns.length}>
          <SubComponent rowData={rowData} />
        </ExpansionContainer>
      );
    }

    return row;
  },
);

ExpandableTableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
  SubComponent: PropTypes.any,
  className: PropTypes.string,
  ExpansionContainer: PropTypes.any,
  expandedValue: PropTypes.bool,
  onClick: PropTypes.func,
  ExpandButtonComponent: PropTypes.node,
};

ExpandableTableRow.defaultProps = {
  SubComponent: null,
  className: '',
  ExpansionContainer: TableRowExpansionContainer,
  expandedValue: undefined,
  onClick: null,
  ExpandButtonComponent: DefaultExpandButton,
};
