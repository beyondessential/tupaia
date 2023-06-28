/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import { DataTable } from '../../DataTable';
import { NoData } from '../../NoData';
import { getIsChartData } from '../utils';
import { getChartTableData } from './getChartTableData';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

export const ChartTable = ({ viewContent, className }) => {
  const { columns, data } = getChartTableData(viewContent);

  if (!getIsChartData(viewContent)) {
    return <NoData viewContent={viewContent} />;
  }

  return (
    <TableContainer className={className}>
      <DataTable columns={columns} data={data} />
    </TableContainer>
  );
};

ChartTable.propTypes = {
  viewContent: PropTypes.shape({
    name: PropTypes.string,
    xName: PropTypes.string,
    periodGranularity: PropTypes.string,
    valueType: PropTypes.string,
    labelType: PropTypes.string,
    chartType: PropTypes.string,
    data: PropTypes.array,
    chartConfig: PropTypes.object,
  }),
  className: PropTypes.string,
};

ChartTable.defaultProps = {
  viewContent: null,
  className: null,
};
