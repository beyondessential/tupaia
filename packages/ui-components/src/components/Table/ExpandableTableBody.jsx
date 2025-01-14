import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ExpandableTableRow as ExpandableTableRowComponent } from './ExpandableTableRow';
import { TableBody } from './TableBody';

const StyledTableBody = styled(TableBody)`
  th:last-child,
  td:last-child {
    padding-right: 65px;
  }
`;

export const ExpandableTableBody = ({ ExpandableTableRow, SubComponent, ...tableBodyProps }) => {
  const TableRow = React.useCallback(
    props => <ExpandableTableRow {...props} SubComponent={SubComponent} />,
    [ExpandableTableRow, SubComponent],
  );
  return <StyledTableBody {...tableBodyProps} TableRow={TableRow} />;
};

ExpandableTableBody.propTypes = {
  ExpandableTableRow: PropTypes.any,
  SubComponent: PropTypes.any,
};

ExpandableTableBody.defaultProps = {
  SubComponent: null,
  ExpandableTableRow: ExpandableTableRowComponent,
};
