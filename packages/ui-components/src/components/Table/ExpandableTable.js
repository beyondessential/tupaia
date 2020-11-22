/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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

export const ExpandableTable = React.memo(({ Body, SubComponent, ...tableProps }) => {
  const TableBody = tableBodyProps => <Body {...tableBodyProps} SubComponent={SubComponent} />;
  return <StyledTable Body={TableBody} {...tableProps} />;
});

ExpandableTable.propTypes = {
  SubComponent: PropTypes.any,
  Body: PropTypes.any,
};

ExpandableTable.defaultProps = {
  SubComponent: null,
  Body: ExpandableTableBody,
};
