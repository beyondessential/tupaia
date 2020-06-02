/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table } from './Table';
import { ExpandableTableBody } from './ExpandableTableBody';

export const ExpandableTable = React.memo(({ SubComponent, expandedAssessor, ...tableProps }) => {
  const TableBody = tableBodyProps => (
    <ExpandableTableBody
      {...tableBodyProps}
      SubComponent={SubComponent}
      expandedAssessor={expandedAssessor}
    />
  );
  return <Table Body={TableBody} {...tableProps} />;
});

ExpandableTable.propTypes = {
  SubComponent: PropTypes.any,
  expandedAssessor: PropTypes.func,
};

ExpandableTable.defaultProps = {
  SubComponent: null,
  expandedAssessor: PropTypes.null,
};
