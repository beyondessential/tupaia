/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import styled from 'styled-components';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import PropTypes from 'prop-types';
import { SelectField } from './Select';

export const MultiSelect = ({ options, placeholder, defaultValue, renderValue, ...props }) => {
  const [selected, setSelected] = React.useState(defaultValue);

  const handleChange = event => {
    setSelected(event.target.value);
  };

  return (
    <SelectField
      SelectProps={{
        displayEmpty: true,
        multiple: true,
        renderValue: selected.length > 0 ? renderValue : () => placeholder,
      }}
      value={selected}
      onChange={handleChange}
      {...props}
    >
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          <Checkbox checked={selected.indexOf(option.value) > -1} />
          <ListItemText primary={option.label} />
        </MenuItem>
      ))}
    </SelectField>
  );
};

MultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.array,
  renderValue: PropTypes.func,
};

MultiSelect.defaultProps = {
  placeholder: 'Please select',
  defaultValue: [],
  renderValue: selected => selected.join(', '),
};
