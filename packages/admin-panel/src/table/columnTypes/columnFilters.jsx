/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiChip from '@material-ui/core/Chip';
import { Autocomplete, Select, TextField } from '@tupaia/ui-components';
import { Search } from '@material-ui/icons';

export const DefaultFilter = styled(TextField).attrs(props => ({
  InputProps: {
    ...props.InputProps,
    startAdornment: <Search />,
  },
  placeholder: 'Search...',
}))`
  margin-block-end: 0;
  font-size: inherit;
  width: 100%;
  min-width: 6rem;
  max-width: 100%;
  // The following is overriding the padding in ui-components to make sure all filters match styling
  .MuiInputBase-input,
  .MuiInputBase-input.MuiAutocomplete-input.MuiInputBase-inputAdornedEnd {
    padding-block: 0.6rem;
    padding-inline: 0.2rem;
  }
  .MuiInputBase-root,
  .MuiAutocomplete-inputRoot.MuiInputBase-adornedEnd.MuiOutlinedInput-adornedEnd {
    padding-inline-start: 0.3rem;
  }
  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

/*
 * Makes boolean fields work with the database filter
 */

export const BooleanSelectFilter = ({ value, onChange, column }) => (
  <Select
    id={column.id}
    options={[
      { label: 'Show All', value: '' },
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ]}
    onChange={e => onChange(e.target.value)}
    value={value ?? ''}
  />
);

BooleanSelectFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  onChange: PropTypes.func,
};

BooleanSelectFilter.defaultProps = {
  onChange: null,
  column: {},
};

export const VerifiedFilter = ({ value, onChange, column }) => (
  <Select
    id={column.id}
    options={[
      { label: 'Show All', value: '' },
      { label: 'Yes', value: 'verified' },
      { label: 'No', value: 'new_user' },
      { label: 'Not Applicable', value: 'unverified' },
    ]}
    onChange={e => onChange(e.target.value)}
    value={value ?? ''}
  />
);

VerifiedFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  value: PropTypes.string,
  onChange: PropTypes.func,
};

VerifiedFilter.defaultProps = {
  value: '',
  onChange: null,
  column: {},
};

const Chip = styled(MuiChip)`
  &:first-child {
    margin-left: 6px;
  }
`;

export const ArrayFilter = React.memo(({ onChange, value }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const onChangeSelection = (event, newSelection) => {
    onChange(newSelection);
    // onChange(
    //   newSelection === null
    //     ? undefined
    //     : {
    //         comparator: '@>',
    //         comparisonValue: `{${newSelection.join(',')}}`,
    //         castAs: 'text[]',
    //       },
    // );
  };

  const getSelection = () => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const selection = getSelection();
  return (
    <Autocomplete
      value={selection}
      inputValue={searchTerm}
      onInputChange={(event, newSearchTerm) => setSearchTerm(newSearchTerm)}
      options={searchTerm.length > 0 ? [searchTerm] : []}
      getOptionLabel={option => option}
      getOptionSelected={(option, selected) => {
        return option === selected;
      }}
      onChange={onChangeSelection}
      muiProps={{
        freeSolo: true,
        multiple: true,
        selectOnFocus: true,
        clearOnBlur: true,
        handleHomeEndKeys: true,
        renderTags: (values, getTagProps) => {
          return values.map((option, index) => {
            console.log(getTagProps({ index }));
            return <Chip color="primary" label={option} {...getTagProps({ index })} />;
          });
        },
        renderInput: params => <DefaultFilter {...params} />,
        disablePortal: true,
      }}
    />
  );
});

ArrayFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
};
