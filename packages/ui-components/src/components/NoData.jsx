/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SmallAlert } from './Alert';

const getNoDataString = ({ noDataMessage, source, startDate, endDate }) => {
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

export const NoData = ({ viewContent }) => {
  return (
    <StyledNoData severity="info" variant="standard">
      {getNoDataString(viewContent)}
    </StyledNoData>
  );
};

NoData.propTypes = {
  viewContent: PropTypes.object,
};

NoData.defaultProps = {
  viewContent: null,
};
