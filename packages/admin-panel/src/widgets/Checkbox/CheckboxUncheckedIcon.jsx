/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SvgIcon } from '@material-ui/core';

export const CheckboxUncheckedIcon = props => {
  return (
    <SvgIcon
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className="checkbox"
      {...props}
    >
      <rect x="0.5" y="0.5" width="14" height="14" rx="2.5" stroke="#DEDEDE" />
    </SvgIcon>
  );
};
