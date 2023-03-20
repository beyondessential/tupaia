/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { ParameterType } from '../../editing';
import { useLocations } from '../../../../VizBuilderApp/api';
import { Autocomplete } from '../../../../autocomplete';

export const OrganisationUnitCodesField = ({ name, onChange, runTimeParams }) => {
  const { hierarchy = 'explore' } = runTimeParams;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]); // [{code:"DL", name:"Demo Land"}]
  const { data: locations = [], isLoading } = useLocations(hierarchy, searchTerm);
  const limitedLocations = locations.slice(0, 20); // limit the options to 20 to stop the ui jamming

  useEffect(() => {
    setSelectedOptions([]);
    onChange([]);
  }, [hierarchy]); // hierarchy determines entity relation visibility

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
        onChange(selectedValues.map(v => v.code));
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
  runTimeParams: PropTypes.object,
};

OrganisationUnitCodesField.defaultProps = {
  runTimeParams: {},
};
