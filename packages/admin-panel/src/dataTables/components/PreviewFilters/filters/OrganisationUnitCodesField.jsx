import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDebounce } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';
import { useEntities } from '../../../../VizBuilderApp/api';
import { Autocomplete } from '../../../../autocomplete';
import { getArrayFieldValue } from './utils';

export const OrganisationUnitCodesField = ({ name, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 100);
  const [selectedOptions, setSelectedOptions] = useState([]); // [{code:"DL", name:"Demo Land"}]
  const { data: entities = [], isLoading } = useEntities(debouncedSearchTerm);
  const limitedLocations = entities.slice(0, 20); // limit the options to 20 to stop the ui jamming

  return (
    <Autocomplete
      value={selectedOptions}
      label={name}
      options={limitedLocations}
      getOptionSelected={(option, selected) => {
        return option.code === selected.code;
      }}
      getOptionLabel={option => option.name}
      isLoading={isLoading}
      onChangeSelection={(event, selectedValues) => {
        setSelectedOptions(selectedValues);
        onChange(getArrayFieldValue(selectedValues.map(v => v.code)));
      }}
      onChangeSearchTerm={setSearchTerm}
      searchTerm={searchTerm}
      placeholder="type to search"
      optionLabelKey="name"
      allowMultipleValues
    />
  );
};

OrganisationUnitCodesField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
