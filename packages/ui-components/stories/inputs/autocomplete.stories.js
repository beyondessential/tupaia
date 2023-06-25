/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import styled from 'styled-components';
import { Autocomplete } from '../../src/components';

export default {
  title: 'Inputs/Autocomplete',
};

const Container = styled.div`
  max-width: 400px;
  padding: 2rem;
`;

const options = [
  { id: 1, name: 'Sentinel Site One' },
  { id: 2, name: 'Sentinel Site Two' },
  { id: 3, name: 'Sentinel Site Three' },
  { id: 4, name: 'Sentinel Site Four' },
  { id: 5, name: 'Sentinel Site Five' },
  { id: 6, name: 'Sentinel Site Six' },
  { id: 7, name: 'Sentinel Site Seven' },
  { id: 8, name: 'Sentinel Site Eight' },
  { id: 9, name: 'Sentinel Site Nine' },
  { id: 10, name: 'Sentinel Site Ten' },
  { id: 11, name: 'Sentinel Site Eleven' },
  { id: 12, name: 'Sentinel Site Twelve' },
];

export const Simple = () => (
  <Container>
    <Autocomplete
      id="simple-autocomplete"
      label="Simple Auto Complete"
      options={options.map(option => option.name)}
      placeholder="Search..."
    />
  </Container>
);

export const Disabled = () => (
  <Container>
    <Autocomplete
      label="Simple Auto Complete"
      options={options.map(option => option.name)}
      placeholder="Search..."
      disabled
    />
  </Container>
);

export const NoLabel = () => (
  <Container>
    <Autocomplete options={options.map(option => option.name)} placeholder="Search..." />
  </Container>
);

export const HelperText = () => (
  <Container>
    <Autocomplete
      label="Helper Text Example"
      options={options.map(option => option.name)}
      placeholder="Search..."
      helperText="This field is required"
      required
    />
  </Container>
);

export const Error = () => (
  <Container>
    <Autocomplete
      label="Simple Auto Complete"
      options={options.map(option => option.name)}
      placeholder="Search..."
      helperText="Please try again!"
      error
    />
  </Container>
);

export const Controlled = () => {
  const [value, setValue] = useState(null);

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  return (
    <Container>
      <Autocomplete
        label="Controlled Auto Complete"
        options={options.map(option => option.name)}
        onChange={handleChange}
        value={value}
        placeholder="Search..."
      />
      <Typography>Selected Value: {value}</Typography>
    </Container>
  );
};

/**
 * Use custom keys to have different labels to saved values
 * This could be useful if you need to save the selected option as an object
 */
export const CustomKeys = () => {
  const [value, setValue] = useState(null);

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  const valueKey = 'id';
  const labelKey = 'name';

  return (
    <Container>
      <Autocomplete
        label="Controlled Auto Complete"
        options={options}
        getOptionSelected={(option, selected) => option[valueKey] === selected[valueKey]}
        getOptionLabel={option => (option ? option[labelKey] : '')}
        onChange={handleChange}
        value={value}
        placeholder="Search..."
      />
      <Typography>Selected Value: {value ? JSON.stringify(value) : 'none'}</Typography>
    </Container>
  );
};

export const FreeText = () => (
  <Container>
    <Autocomplete
      label="Mui Props Example"
      options={options.map(option => option.name)}
      placeholder="Search..."
      helperText="Type free text or select an option"
      muiProps={{
        freeSolo: true,
      }}
    />
  </Container>
);

export const Tags = () => {
  const [value, setValue] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  return (
    <Container>
      <Autocomplete
        label="Mui Props Example"
        options={options.map(option => option.name)}
        defaultValue={['Sentinel Site Twelve']}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        value={value}
        placeholder="Search..."
        helperText="Type free text or select an option"
        muiProps={{
          freeSolo: true,
          multiple: true,
          selectOnFocus: true,
          clearOnBlur: true,
          handleHomeEndKeys: true,
          renderTags: (selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip color="primary" label={option} {...getTagProps({ index })} />
            )),
        }}
      />
    </Container>
  );
};

export const Tooltip = () => (
  <Container>
    <Autocomplete
      id="tooltip-autocomplete"
      label="Auto Complete with tooltip label"
      options={options.map(option => option.name)}
      placeholder="Search..."
      tooltip="This is a tooltip"
    />
  </Container>
);
