import React, { useState } from 'react';
import MuiMenuItem from '@material-ui/core/MenuItem';
import styled from 'styled-components';
import { SelectField } from './Select';
import { Checkbox } from './Checkbox';
import { TextFieldProps, SelectProps } from '@material-ui/core';

const StyledCheckbox = styled(Checkbox)`
  margin: 0;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem;
`;

const MenuItem = styled(MuiMenuItem)`
  padding-top: 0;
  padding-bottom: 0;
`;

type Option = {
  value: any;
  label: string;
};

type MultiSelectProps = TextFieldProps & {
  options: Option[];
  placeholder?: string;
  defaultValue?: any[];
  renderValue?: SelectProps['renderValue'];
};

export const MultiSelect = ({
  options,
  placeholder = 'Please select',
  defaultValue = [],
  renderValue,
  ...props
}: MultiSelectProps) => {
  const [selected, setSelected] = useState<any[]>(defaultValue);
  const renderSelectedValue = () => {
    if (selected.length > 0)
      return renderValue ? renderValue(selected) : <>{selected.join(', ')}</>;
    return <>{placeholder}</>;
  };
  return (
    <SelectField
      SelectProps={{
        displayEmpty: true,
        multiple: true,
        renderValue: renderSelectedValue,
      }}
      value={selected}
      onChange={event => setSelected(event.target.value as any)}
      {...props}
    >
      {options.map((option: Option) => (
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
