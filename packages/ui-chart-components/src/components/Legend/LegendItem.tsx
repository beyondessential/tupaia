/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';

const getLegendTextColor = (theme: any, isExporting: boolean) => {
  if (isExporting) {
    return '#2c3236';
  }

  if (theme.palette.type === 'light') {
    return theme.palette.text.primary;
  }
  return 'white';
};

export const LegendItem = styled(({ isExporting, ...props }) => <MuiButton {...props} />)`
  text-align: left;
  font-size: 0.75rem;
  padding-bottom: 0;
  padding-top: 0;
  margin-right: 1.2rem;

  .MuiButton-label {
    display: flex;
    white-space: nowrap;
    align-items: center;
    color: ${({ theme, isExporting }) => getLegendTextColor(theme, isExporting)};
    > div {
      width: ${isExporting => (isExporting ? '100%' : '')};
    }
  }

  &.Mui-disabled {
    color: ${({ theme, isExporting }) => getLegendTextColor(theme, isExporting)};
  }

  // small styles
  &.small {
    font-size: 0.5rem;
    padding-bottom: 0;
    padding-top: 0;
    margin-right: 0;
  }
`;
