/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ExpandableTableRow as ExpandableTableRowComponent } from './ExpandableTableRow';
import { TableBody } from './TableBody';

export const ExpandableTableBody = ({ ExpandableTableRow, SubComponent, ...tableBodyProps }) => {
  const TableRow = tableRowProps => (
    <ExpandableTableRow {...tableRowProps} SubComponent={SubComponent} />
  );
  return <TableBody {...tableBodyProps} TableRow={TableRow} />;
};

ExpandableTableBody.propTypes = {
  ExpandableTableRow: PropTypes.any,
  SubComponent: PropTypes.any,
};

ExpandableTableBody.defaultProps = {
  SubComponent: null,
  ExpandableTableRow: ExpandableTableRowComponent,
};
