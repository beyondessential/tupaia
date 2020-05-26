/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  ExpandableTableBody,
  TableRow,
  ControlledExpandableTableRow,
  tableColumnShape,
} from '@tupaia/ui-components';
import * as COLORS from '../../theme/colors';

export const BorderlessTableRow = styled(ControlledExpandableTableRow)`
  .MuiTableCell-root {
    font-size: 15px;
    line-height: 18px;
    border: none;
    padding: 0;
    text-align: center;
    height: 42px;
    color: ${props => props.theme.palette.text.primary};

    &:first-child {
      padding-left: 1.25rem;
      text-align: left;
    }
  }
`;

const ActiveBorderlessTableRow = props => <BorderlessTableRow {...props} expanded />;

const BorderlessTableBody = props => (
  <ExpandableTableBody TableRow={ActiveBorderlessTableRow} {...props} />
);

// Todo: investigate using table row rather than table body to customise styles of tables
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

export const DottedTableRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 14px;
    line-height: 16px;
    padding: 0.8rem 1rem;
    border-bottom: 1px dashed ${COLORS.GREY_DE};
    color: ${props => props.theme.palette.text.primary};
    text-align: left;
    height: auto;
  }
`;

const DottedTableBody = props => <TableBody TableRow={DottedTableRow} {...props} />;

export const DottedTable = ({ columns, data }) => {
  console.log('data', data);
  return <Table Header={false} Body={DottedTableBody} columns={columns} data={data} />;
};

DottedTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};

export const SimpleTableRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 14px;
    line-height: 16px;
    border-bottom: 1px solid ${COLORS.GREY_DE};
    padding: 0.8rem 1rem;
    text-align: left;
    height: auto;
    color: ${props => props.theme.palette.text.primary};
  }
`;

const SimpleTableBody = props => <TableBody TableRow={SimpleTableRow} {...props} />;

export const SimpleTable = ({ columns, data }) => {
  return <Table Header={false} Body={SimpleTableBody} columns={columns} data={data} />;
};

SimpleTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};
