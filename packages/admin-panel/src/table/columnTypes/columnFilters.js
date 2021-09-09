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

export const BooleanSelectFilter = ({ filter, onChange }) => (
  <Select
    options={[
      { label: 'Show All', value: '' },
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ]}
    onChange={event => onChange(event.target.value)}
    value={filter ? filter.value : ''}
  />
);

// eslint-disable-next-line react/prop-types
export const VerifiedFilter = ({ filter, onChange }) => (
  <Select
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

BooleanSelectFilter.propTypes = {
  filter: PropTypes.PropTypes.shape({
    value: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

BooleanSelectFilter.defaultProps = {
  filter: null,
  onChange: null,
};
VerifiedFilter.propTypes = {
  filter: PropTypes.PropTypes.shape({
    value: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

VerifiedFilter.defaultProps = {
  filter: null,
  onChange: null,
};
