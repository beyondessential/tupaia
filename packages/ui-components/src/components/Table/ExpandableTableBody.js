/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ExpandableTableRow as ExpandableTableRowComponent } from './ExpandableTableRow';
import { TableBody } from './TableBody';

export const ExpandableTableBody = ({
  ExpandableTableRow,
  expandedAssessor,
  SubComponent,
  ...tableBodyProps
}) => {
  const TableRow = tableRowProps => (
    <ExpandableTableRow
      {...tableRowProps}
      SubComponent={SubComponent}
      expandedAssessor={expandedAssessor}
    />
  );
  return <TableBody {...tableBodyProps} TableRow={TableRow} />;
};

ExpandableTableBody.propTypes = {
  ExpandableTableRow: PropTypes.any,
  expandedAssessor: PropTypes.func,
  SubComponent: PropTypes.any,
};

ExpandableTableBody.defaultProps = {
  SubComponent: null,
  expandedAssessor: null,
  ExpandableTableRow: ExpandableTableRowComponent,
};
