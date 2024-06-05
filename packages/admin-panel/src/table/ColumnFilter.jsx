/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { labelToId } from '../utilities';

export const ColumnFilter = ({ column, value, onChange }) => (
  <TextField
    type="text"
    placeholder="Type to filter"
    value={value ?? ''}
    onChange={e => onChange(e.target.value)}
    id={`dataTableColumnFilter-${labelToId(column?.id)}`}
  />
);

ColumnFilter.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string,
  }),
  value: PropTypes.string,
  onChange: PropTypes.func,
};

ColumnFilter.defaultProps = {
  column: null,
  value: '',
  onChange: null,
};
