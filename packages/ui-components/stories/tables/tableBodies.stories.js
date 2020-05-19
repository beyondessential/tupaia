/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import { FakeAPI } from '../story-utils/api';
import * as COLORS from '../story-utils/theme/colors';
import { tableColumnShape } from '../../src/components/Table/tableColumnShape';
import {
  Button,
  Table,
  TableBody,
  FakeHeader,
  CondensedTableRow,
  CondensedTableBody,
  TableRow,
} from '../../src';

export default {
  title: 'Tables/TableBodies',
  component: Table,
};

const Container = styled.div`
  width: 100%;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  > div {
    max-width: 900px;
    margin: 0 auto;
  }
`;

const Inner = styled.div`
  width: 500px;
  background: white;
`;

const StyledRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 15px;
    line-height: 18px;
    border: none;
    padding: 0.8rem 1rem;
    text-align: left;
    height: auto;
    color: #414D55;
  }
`;

const CustomBody = ({ data, rowIdKey, columns }) => (
  <TableBody StyledTableRow={StyledRow} data={data} rowIdKey={rowIdKey} columns={columns} />
);

CustomBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
};

export const PanesTable = () => {
  return (
    <Container>
      <Inner>
        <FakeHeader>SYNDROMES</FakeHeader>
        <Table Header={false} Body={CustomBody} columns={paneColumns} data={siteData} />
      </Inner>
    </Container>
  );
};
