/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import { DataTable, SmallAlert } from '@tupaia/ui-components';
import { getChartTableData, getIsChartData, getNoDataString } from '../utils';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

export const ChartTable = ({ viewContent, className }) => {
  const { columns, data } = getChartTableData(viewContent);

  if (!getIsChartData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
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
