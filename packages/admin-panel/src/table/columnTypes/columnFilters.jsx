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

export const BooleanSelectFilter = ({ filter, onChange, column }) => {
  return (
    <Select
      id={column.id}
      options={[
        { label: 'Show all', value: '' },
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ]}
      onChange={e => onChange(e.target.value)}
      value={filter?.value ?? ''}
    />
  );
};

BooleanSelectFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  filter: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  }),
  onChange: PropTypes.func,
};

BooleanSelectFilter.defaultProps = {
  onChange: null,
  column: {},
  filter: {},
};

/*
 * Makes outdated field work with the database filter
 */

export const OutdatedFilter = ({ filter, onChange, column }) => {
  return (
    <Select
      id={column.id}
      options={[
        { label: 'Show all', value: '' },
        { label: 'Archived', value: true },
        { label: 'Current', value: false },
      ]}
      onChange={e => onChange(e.target.value)}
      value={filter?.value ?? ''}
    />
  );
};

OutdatedFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  filter: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  }),
  onChange: PropTypes.func,
};

OutdatedFilter.defaultProps = {
  onChange: null,
  column: {},
  filter: {},
};

export const VerifiedFilter = ({ filter, onChange, column }) => {
  return (
    <Select
      id={column.id}
      options={[
        { label: 'Show all', value: '' },
        { label: 'Yes', value: 'verified' },
        { label: 'No', value: 'new_user' },
        { label: 'Not applicable', value: 'unverified' },
      ]}
      onChange={e => onChange(e.target.value)}
      value={filter.value ?? ''}
    />
  );
};

VerifiedFilter.propTypes = {
  column: PropTypes.PropTypes.shape({
    id: PropTypes.string,
  }),
  filter: PropTypes.shape({
    value: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

VerifiedFilter.defaultProps = {
  filter: {},
  onChange: null,
  column: {},
};

const Chip = styled(MuiChip)`
  &:first-child {
    margin-left: 6px;
  }
`;

export const ArrayFilter = React.memo(
  ({ onChange, filter }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const onChangeSelection = (event, newSelection) => {
      onChange(newSelection);
    };

    const getSelection = () => {
      if (!filter?.value) return [];
      if (Array.isArray(filter?.value)) return filter.value;
      return [filter.value];
    };

    const selection = getSelection();

    return (
      <Autocomplete
        value={selection}
        inputValue={searchTerm}
        onInputChange={(event, newSearchTerm) => {
          if (!event) return null;
          return setSearchTerm(newSearchTerm);
        }}
        options={searchTerm?.length > 0 ? [searchTerm] : []}
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
              return <Chip color="primary" label={option} {...getTagProps({ index })} />;
            });
          },
          renderInput: params => <DefaultFilter {...params} />,
          disablePortal: true,
        }}
      />
    );
  },
  (prevProps, nextProps) => prevProps.filter.value === nextProps.filter.value,
);

ArrayFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  filter: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  }),
};

ArrayFilter.defaultProps = {
  filter: {},
};
