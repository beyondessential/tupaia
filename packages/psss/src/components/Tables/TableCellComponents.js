/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Error } from '@material-ui/icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';

export const SitesReportedCell = data => {
  // Todo: update placeholder
  return <span>{`${data.sitesReported}/30`}</span>;
};

const AFRAlert = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: ${props => props.theme.palette.warning.light};
  border-radius: 5px;
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;

  .MuiSvgIcon-root {
    width: 20px;
    height: 20px;
    margin-left: 5px;
  }
`;

export const AFRCell = ({ AFR }) => {
  // Todo: update placeholder
  if (AFR > 500) {
    return (
      <AFRAlert>
        {AFR}
        <Error />
      </AFRAlert>
    );
  }

  return AFR;
};

const WarningStyleText = styled.span`
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
`;

const SuccessStyleText = styled.span`
  color: ${props => props.theme.palette.success.main};
  font-weight: 500;
`;

export const PercentageChangeCell = ({ percentageChange }) => {
  if (percentageChange > 0) {
    return <WarningStyleText>{`${percentageChange}%`}</WarningStyleText>;
  }

  return <SuccessStyleText>{percentageChange}</SuccessStyleText>;
};

PercentageChangeCell.propTypes = {
  percentageChange: PropTypes.string.isRequired,
};
