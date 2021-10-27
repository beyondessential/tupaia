/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Select } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
/*
 * Makes boolean fields work with the database filter
 * https://github.com/tannerlinsley/react-table/tree/v6/examples/custom-filtering
 */

export const BooleanSelectFilter = ({ filter, onChange, column }) => (
  <Select
    id={column.id}
    options={[
      { label: 'Show All', value: '' },
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ]}
    onChange={event => onChange(event.target.value)}
    value={filter ? filter.value : ''}
  />
);

BooleanSelectFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  filter: PropTypes.PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  }),
  onChange: PropTypes.func,
};

BooleanSelectFilter.defaultProps = {
  filter: null,
  onChange: null,
  column: {},
};

export const VerifiedFilter = ({ filter, onChange, column }) => (
  <Select
    id={column.id}
    options={[
      { label: 'Show All', value: '' },
      { label: 'Yes', value: 'verified' },
      { label: 'No', value: 'new_user' },
      { label: 'Not Applicable', value: 'unverified' },
    ]}
    onChange={event => onChange(event.target.value)}
    value={filter ? filter.value : ''}
  />
);

VerifiedFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  filter: PropTypes.PropTypes.shape({
    value: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

VerifiedFilter.defaultProps = {
  filter: null,
  onChange: null,
  column: {},
};
