/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable react/prop-types */

import React from 'react';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Select } from '@tupaia/ui-components';
import { IconButton } from '../widgets';

export const customPagination = () => ({
  PreviousComponent: props => (
    <IconButton {...props}>
      <NavigateBeforeIcon />
    </IconButton>
  ),
  NextComponent: props => (
    <IconButton {...props}>
      <NavigateNextIcon />
    </IconButton>
  ),
  // @see https://github.com/tannerlinsley/react-table/tree/v6 for documentation of props
  renderPageSizeOptions: ({ pageSize, pageSizeOptions, rowsSelectorText, onPageSizeChange }) => (
    <span className="select-wrap -pageSizeOptions">
      <Select
        id={rowsSelectorText}
        options={pageSizeOptions.map(option => ({
          label: `Rows per page: ${option}`,
          value: option,
        }))}
        onChange={e => onPageSizeChange(Number(e.target.value))}
        value={pageSize}
      />
    </span>
  ),
});
