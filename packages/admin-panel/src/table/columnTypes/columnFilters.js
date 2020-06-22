/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';

/*
 * Makes boolean fields work with the database filter
 * https://github.com/tannerlinsley/react-table/tree/v6/examples/custom-filtering
 */
export const BooleanSelectFilter = ({ filter, onChange }) => (
  <select
    onChange={event => {
      const boolValue = event.target.value === 'true';
      onChange(boolValue);
    }}
    style={{ width: '100%' }}
    value={filter ? filter.value : ''}
  >
    <option value="">Show All</option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
);
