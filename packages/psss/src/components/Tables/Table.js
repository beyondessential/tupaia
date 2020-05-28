/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Table, tableColumnShape } from '@tupaia/ui-components';
import { SimpleTableBody, DottedTableBody, BorderlessTableBody } from './TableBody';

export const SimpleTable = ({ columns, data }) => {
  return <Table Header={false} Body={SimpleTableBody} columns={columns} data={data} />;
};

SimpleTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};

export const BorderlessTable = ({ columns, data, SubComponent }) => {
  return (
    <Table
      Header={false}
      Body={BorderlessTableBody}
      columns={columns}
      data={data}
      SubComponent={SubComponent}
    />
  );
};

BorderlessTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  SubComponent: PropTypes.any,
};

BorderlessTable.defaultProps = {
  SubComponent: null,
};

export const DottedTable = ({ columns, data }) => {
  return <Table Header={false} Body={DottedTableBody} columns={columns} data={data} />;
};

DottedTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};
