/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import { FormLabelProps } from '@material-ui/core';

export type ListItemType = Record<string, unknown> & {
  children?: ListItemType[];
  content: string | ReactNode;
  value: string;
  selected?: boolean;
  icon?: ReactNode;
  tooltip?: string;
  button?: boolean;
  disabled?: boolean;
};
