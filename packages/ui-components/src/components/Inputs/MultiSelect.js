/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiMenuItem from '@material-ui/core/MenuItem';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SelectField } from './Select';
import { Checkbox } from './Checkbox';

const StyledCheckbox = styled(Checkbox)`
  margin: 0;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem;
`;

const MenuItem = styled(MuiMenuItem)`
  padding-top: 0;
  padding-bottom: 0;
`;

export const MultiSelect = ({ options, placeholder, defaultValue, renderValue, ...props }) => {
  const [selected, setSelected] = React.useState(defaultValue);
  return (
    <SelectField
      SelectProps={{
        displayEmpty: true,
        multiple: true,
        renderValue: selected.length > 0 ? renderValue : () => placeholder,
      }}
      value={selected}
      onChange={event => setSelected(event.target.value)}
      {...props}
    >
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          <StyledCheckbox
            color="primary"
            label={option.label}
            checked={selected.indexOf(option.value) > -1}
          />
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
  tooltip: PropTypes.string,
};

MultiSelect.defaultProps = {
  placeholder: 'Please select',
  defaultValue: [],
  renderValue: selected => selected.join(', '),
  tooltip: '',
};
