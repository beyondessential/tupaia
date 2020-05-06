/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Error } from '@material-ui/icons';
import styled from 'styled-components';
import * as COLORS from '../theme/colors';

export const getSitesReported = data => {
  return <span>{`${data.sitesReported}/30`}</span>;
};

const AFRAlert = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: ${COLORS.LIGHT_RED};
  border-radius: 5px;
  color: ${COLORS.RED};
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;

  .MuiSvgIcon-root {
    width: 20px;
    height: 20px;
    margin-left: 5px;
  }
`;

export const getAFRAlert = ({ AFR }) => {
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
