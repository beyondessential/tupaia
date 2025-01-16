import React, { useState, useCallback, ChangeEvent } from 'react';
import MuiMenuItem from '@material-ui/core/MenuItem';
import { ListSubheader, SvgIconProps, TextFieldProps } from '@material-ui/core';
import { KeyboardArrowDown as MuiKeyboardArrowDown } from '@material-ui/icons';
import styled from 'styled-components';
import { TextField } from './TextField';

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

export const GroupedSelectField = ({ SelectProps = {}, ...props }: TextFieldProps) => (
  <StyledTextField
    SelectProps={{
      IconComponent: (iconProps: SvgIconProps) => <KeyboardArrowDown {...iconProps} />,
      ...SelectProps,
    }}
    {...(props as any)}
    select
  />
);

const MenuItem = styled(MuiMenuItem)`
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
`;

type GroupedSelectProps = TextFieldProps & {
  groupedOptions: { [key: string]: { label: string; value?: string }[] };
  showPlaceholder?: boolean;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<{ name?: string; value: any }>) => void;
};

export const GroupedSelect = ({
  value = '',
  onChange,
  groupedOptions,
  showPlaceholder = true,
  placeholder = 'Please select',
  defaultValue = '',
  ...props
}: GroupedSelectProps) => {
  const [localValue, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    [setValue],
  );

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
      value={onChange ? value : localValue}
      onChange={onChange || handleChange}
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
