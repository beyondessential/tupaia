/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { SelectField } from '../Inputs';

export const DatePicker = ({ label, selectedValue, onChange, menuItems }) => (
  <SelectField label={label} value={selectedValue} onChange={onChange}>
    {menuItems}
  </SelectField>
);

DatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  selectedValue: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  menuItems: PropTypes.array.isRequired,
};
