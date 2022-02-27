/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiChip from '@material-ui/core/Chip';
import { Autocomplete, Select } from '@tupaia/ui-components';

/*
 * Makes boolean fields work with the database filter
 * https://github.com/tannerlinsley/react-table/tree/v6/examples/custom-filtering
 */

export const BooleanSelectFilter = ({ filter, onChange, column }) => (
  <Select
    id={column.id}
    options={[
      { label: 'Show All', value: '' },
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ]}
    onChange={event => onChange(event.target.value)}
    value={filter ? filter.value : ''}
  />
);

BooleanSelectFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  filter: PropTypes.PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  }),
  onChange: PropTypes.func,
};

BooleanSelectFilter.defaultProps = {
  filter: null,
  onChange: null,
  column: {},
};

export const VerifiedFilter = ({ filter, onChange, column }) => (
  <Select
    id={column.id}
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

VerifiedFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  filter: PropTypes.PropTypes.shape({
    value: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

VerifiedFilter.defaultProps = {
  filter: null,
  onChange: null,
  column: {},
};

const Chip = styled(MuiChip)`
  &:first-child {
    margin-left: 6px;
  }
`;

const StyledAutocomplete = styled(Autocomplete)`
  flex: 1;
`;

export const ArrayFilter = React.memo(({ onChange }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selection, setSelection] = React.useState([]);

  const onChangeSelection = (event, newSelection) => {
    setSelection(newSelection);
    onChange(
      newSelection === null
        ? undefined
        : {
            comparator: '@>',
            comparisonValue: `{${newSelection.join(',')}}`,
            castAs: 'text[]',
          },
    );
  };

  return (
    <StyledAutocomplete
      value={selection || []}
      inputValue={searchTerm}
      onInputChange={(event, newSearchTerm) => setSearchTerm(newSearchTerm)}
      options={searchTerm.length > 0 ? [searchTerm] : []}
      getOptionSelected={(option, selected) => option === selected}
      onChange={onChangeSelection}
      placeholder={selection.length === 0 ? 'Enter values' : ''}
      muiProps={{
        freeSolo: true,
        multiple: true,
        selectOnFocus: true,
        clearOnBlur: true,
        handleHomeEndKeys: true,
        renderTags: (values, getTagProps) =>
          values.map((option, index) => (
            <Chip color="primary" label={option} {...getTagProps({ index })} />
          )),
      }}
    />
  );
});

ArrayFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
};
