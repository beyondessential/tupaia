/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash.debounce';
import MuiPaper from '@material-ui/core/Paper';
import { Autocomplete as AutocompleteComponent, FlexStart } from '@tupaia/ui-components';
import { useLocations } from '../api/queries';
import { useVizBuilderConfig } from '../vizBuilderConfigStore';

const Container = styled(FlexStart)`
  padding-top: 24px;
  padding-bottom: 24px;
`;

const Text = styled(Typography)`
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  display: block;
  width: 140px;
`;

const Autocomplete = styled(AutocompleteComponent)`
  flex: 1;
  margin: 0 0 0 15px;
  max-width: 30%;

  input.MuiInputBase-input.MuiOutlinedInput-input.MuiAutocomplete-input {
    font-size: 14px;
    line-height: 1;
    padding: 10px;
  }

  .MuiFormControl-root {
    margin: 0;
  }
`;

const PaperComponent = styled(MuiPaper)`
  .MuiAutocomplete-option {
    font-size: 14px;
  }
`;

const LocationField = () => {
  const [search, setSearch] = useState('');
  const [{ project, location }, { setValue }] = useVizBuilderConfig();

  // Show the default options in the dropdown when an item is selected.
  // Otherwise it shows no options
  const query = search === location ? '' : search;

  const { data: locations = [], isLoading } = useLocations(project, query);

  const options = locations.map(p => p.code).slice(0, 1000); // limit the options to 1000 to stop the ui jamming

  return (
    <Autocomplete
      id="location"
      placeholder="Select Location"
      value={location}
      onChange={(event, value) => setValue('location', value)}
      options={options}
      loading={isLoading}
      onInputChange={debounce(
        (event, newValue) => {
          setSearch(newValue);
        },
        [200],
      )}
      muiProps={{ PaperComponent }}
    />
  );
};

export const PreviewOptions = () => {
  return (
    <Container>
      <Text>Preview Options:</Text>
      <LocationField />
    </Container>
  );
};
