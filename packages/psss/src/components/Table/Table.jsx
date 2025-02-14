import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table, tableColumnShape } from '@tupaia/ui-components';
import { SimpleTableBody, DottedTableBody, BorderlessTableBody } from './TableBody';
import { GreyTableHeader } from './TableHeader';

const StyledTable = styled(Table)`
  padding: 0 1.2rem 0.3rem;
`;

export const SimpleTable = ({ columns, data }) => {
  return <StyledTable Header={false} Body={SimpleTableBody} columns={columns} data={data} />;
};

SimpleTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};

export const BorderlessTable = ({ columns, data, SubComponent }) => {
  return (
    <StyledTable
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
  SubComponent: PropTypes.node,
};

BorderlessTable.defaultProps = {
  SubComponent: null,
};

export const DottedTable = ({ columns, data }) => {
  return (
    <StyledTable Header={GreyTableHeader} Body={DottedTableBody} columns={columns} data={data} />
  );
};

DottedTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};
