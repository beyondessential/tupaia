/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField } from '@tupaia/ui-components';
import PropTypes from 'prop-types';

export const ColumnFilter = ({ filter, onChange }) => (
  <TextField
    type="text"
    placeholder="Type to filter"
    value={filter ? filter.value : ''}
    onChange={event => onChange(event.target.value)}
  />
);

ColumnFilter.propTypes = {
  filter: PropTypes.PropTypes.shape({
    value: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

ColumnFilter.defaultProps = {
  filter: null,
  onChange: null,
};
