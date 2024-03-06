/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SmallAlert } from './Alert';

const getNoDataString = (config = {}, report = {}) => {
  const { noDataMessage, source, startDate: configStartDate, endDate: configEndDate } = config;
  const { startDate: reportStartDate, endDate: reportEndDate } = report;

  const startDate = reportStartDate || configStartDate;
  const endDate = reportEndDate || configEndDate;

  if (noDataMessage) {
    return noDataMessage;
  }

  if (source === 'mSupply') {
    return 'Requires mSupply';
  }

  if (startDate && endDate) {
    return `No data for ${startDate} to ${endDate}`;
  }

  return 'No data';
};

const StyledNoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

export const NoData = ({ config, report }) => {
  return (
    <StyledNoData severity="info" variant="standard">
      {getNoDataString(config, report)}
    </StyledNoData>
  );
};

NoData.propTypes = {
  config: PropTypes.object,
  report: PropTypes.object,
};

NoData.defaultProps = {
  config: {},
  report: {},
};
