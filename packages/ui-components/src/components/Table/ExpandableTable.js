/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table } from './Table';
import { ExpandableTableBody } from './ExpandableTableBody';

export const ExpandableTable = React.memo(({ Body, SubComponent, ...tableProps }) => {
  const TableBody = tableBodyProps => <Body {...tableBodyProps} SubComponent={SubComponent} />;
  return <Table Body={TableBody} {...tableProps} />;
});

ExpandableTable.propTypes = {
  SubComponent: PropTypes.any,
  Body: PropTypes.any,
};

ExpandableTable.defaultProps = {
  SubComponent: null,
  Body: ExpandableTableBody,
};
