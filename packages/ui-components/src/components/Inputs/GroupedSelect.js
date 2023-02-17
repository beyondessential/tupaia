/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import MuiMenuItem from '@material-ui/core/MenuItem';
import { KeyboardArrowDown as MuiKeyboardArrowDown } from '@material-ui/icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from './TextField';
import { ListSubheader } from '@material-ui/core';

const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 24px;
  top: calc(50% - 12px);
  right: 0.9rem;
`;

const StyledTextField = styled(TextField)`
  .MuiSelect-root {
    padding-right: 1.8rem;
    color: ${props => props.theme.palette.text.primary};

    &:focus {
      background: white;
    }
  }
`;

export const GroupedSelectField = ({ SelectProps, ...props }) => (
  <StyledTextField
    SelectProps={{
      IconComponent: iconProps => <KeyboardArrowDown {...iconProps} />,
      ...SelectProps,
    }}
    {...props}
    select
  />
);

GroupedSelectField.propTypes = {
  SelectProps: PropTypes.object,
};

GroupedSelectField.defaultProps = {
  SelectProps: null,
};

export const MenuItem = styled(MuiMenuItem)`
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
`;

export const GroupedSelect = ({
  value,
  onChange,
  groupedOptions,
  showPlaceholder,
  placeholder,
  defaultValue,
  ...props
}) => {
  const [localValue, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  const isControlled = onChange !== null;

  // We need to flatten our tree as mui select requires group headings to be adjacent to options, rather than parents
  const flatSetOfItems = [];
  for (const [groupLabel, optionsForGroup] of Object.entries(groupedOptions)) {
    flatSetOfItems.push({ type: 'heading', label: groupLabel });
    for (const option of optionsForGroup) {
      flatSetOfItems.push({ type: 'option', ...option });
    }
  }

  return (
    <GroupedSelectField
      value={isControlled ? value : localValue}
      onChange={isControlled ? onChange : handleChange}
      SelectProps={{
        displayEmpty: true,
      }}
      {...props}
    >
      {showPlaceholder && (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      )}

      {flatSetOfItems.map(item =>
        item.type === 'heading' ? (
          <ListSubheader key={item.label}>{item.label}</ListSubheader>
        ) : (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ),
      )}
    </GroupedSelectField>
  );
};

GroupedSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  groupedOptions: PropTypes.object.isRequired, // map of group label => standard options array e.g. { Cats: [{ label: 'Ginger', value: 1 }] }
  placeholder: PropTypes.string,
  showPlaceholder: PropTypes.bool,
  defaultValue: PropTypes.any,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

GroupedSelect.defaultProps = {
  placeholder: 'Please select',
  showPlaceholder: true,
  defaultValue: '',
  value: '',
  label: null,
  onChange: null,
};
