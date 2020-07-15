/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiTableSortLabel from '@material-ui/core/TableSortLabel';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import PropTypes from 'prop-types';
import { tableColumnShape } from './tableColumnShape';
import { TableCell } from './TableRow';

const fakeHeaderBackgroundColor = '#f1f1f1';

/*
 * This is just a full width grey box.
 * It should not be used inside the table or else it will skew the column sizes
 */
export const FakeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${fakeHeaderBackgroundColor};
  font-weight: 500;
  font-size: 11px;
  line-height: 13px;
  color: ${props => props.theme.palette.text.secondary};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  padding: 11px 20px;
`;

const TableHeaderCell = styled(TableCell)`
  height: 50px;
  padding-right: 0.3rem;
  padding-left: 0.3rem;
`;

const SortLabel = styled(MuiTableSortLabel)`
  flex-direction: row-reverse;
  color: ${props => props.theme.palette.text.primary};
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-left: -0.6rem;
  font-weight: 600;

  .MuiTableSortLabel-icon {
    opacity: 1;
    margin: 0 2px;
  }
`;

export const TableHeader = React.memo(({ columns, order, orderBy, onChangeOrderBy, className }) => {
  const getContent = (key, sortable, title) =>
    sortable ? (
      <SortLabel
        IconComponent={UnfoldMoreIcon}
        active={orderBy === key}
        direction={order}
        onClick={() => onChangeOrderBy(key)}
      >
        {title}
      </SortLabel>
    ) : (
      title
    );

  return (
    <MuiTableHead className={className}>
      <MuiTableRow>
        {columns.map(({ key, title, width = null, align = 'center', sortable = true }) => (
          <TableHeaderCell key={key} style={{ width: width }} align={align}>
            {getContent(key, sortable, title)}
          </TableHeaderCell>
        ))}
      </MuiTableRow>
    </MuiTableHead>
  );
});

TableHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  onChangeOrderBy: PropTypes.func,
  orderBy: PropTypes.string,
  order: PropTypes.string,
  className: PropTypes.string,
};

TableHeader.defaultProps = {
  onChangeOrderBy: null,
  orderBy: null,
  order: 'asc',
  className: null,
};
