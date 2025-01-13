import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiChip from '@material-ui/core/Chip';
import { Autocomplete } from '@tupaia/ui-components';

const Chip = styled(MuiChip)`
  &:first-child {
    margin-left: 6px;
  }
`;

const StyledAutocomplete = styled(Autocomplete)`
  flex: 1;
`;

export const getArrayFilter = translate => {
  const ArrayFilter = React.memo(({ onChange }) => {
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
        placeholder={selection.length === 0 ? translate('admin.enterValues') : ''}
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

  return ArrayFilter;
};
