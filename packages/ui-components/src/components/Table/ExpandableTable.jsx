import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Table } from './Table';
import { ExpandableTableBody } from './ExpandableTableBody';

const StyledTable = styled(Table)`
  th:last-child,
  td:last-child {
    padding-right: 65px;
  }
`;

export const ExpandableTable = React.memo(({ Body, SubComponent, isFetching, ...tableProps }) => {
  const TableBody = React.useCallback(props => <Body {...props} SubComponent={SubComponent} />, [
    Body,
    SubComponent,
  ]);
  return <StyledTable Body={TableBody} {...tableProps} isFetching={isFetching} />;
});

ExpandableTable.propTypes = {
  SubComponent: PropTypes.any,
  Body: PropTypes.any,
  isFetching: PropTypes.bool,
};

ExpandableTable.defaultProps = {
  SubComponent: null,
  Body: ExpandableTableBody,
  isFetching: false,
};
