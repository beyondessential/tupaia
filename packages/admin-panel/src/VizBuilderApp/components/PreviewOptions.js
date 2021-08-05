/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash.debounce';
import MuiPaper from '@material-ui/core/Paper';
import { Autocomplete as AutocompleteComponent, FlexStart } from '@tupaia/ui-components';
import { useLocations, useProjects } from '../api/queries';
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

const ProjectField = ({ project, projects, isLoadingProjects, onChange }) => (
  <Autocomplete
    id="project"
    placeholder="Select Project"
    value={project}
    defaultValue={project}
    options={projects}
    getOptionLabel={option => option['entity.name']}
    renderOption={option => <span>{option['entity.name']}</span>}
    onChange={onChange}
    loading={isLoadingProjects}
    muiProps={{ PaperComponent }}
  />
);

const LocationField = ({
  disabled,
  location,
  locations,
  isLoadingLocations,
  setLocationSearch,
  onChange,
}) => (
  <Autocomplete
    id="location"
    placeholder="Select Location"
    value={location}
    options={locations}
    loading={isLoadingLocations}
    onInputChange={debounce(
      (event, newValue) => {
        setLocationSearch(newValue.name);
      },
      [200],
    )}
    getOptionLabel={option => option.name}
    renderOption={option => <span>{option.name}</span>}
    onChange={onChange}
    muiProps={{ PaperComponent }}
    disabled={disabled}
  />
);

export const PreviewOptions = () => {
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedProjectOption, setSelectedProjectOption] = useState(null);
  const [selectedLocationOption, setSelectedLocationOption] = useState(null);
  const [{ project, location }, { setProject, setLocation }] = useVizBuilderConfig();

  const handleSelectProject = useCallback((event, value) => {
    if (!value) {
      return;
    }

    setSelectedProjectOption(value);
    setProject(value['project.code']);
  });
  const handleSelectLocation = useCallback((event, value) => {
    if (!value) {
      return;
    }

    setSelectedLocationOption(value);
    setLocation(value.code);
  });

  // Show the default options in the dropdown when an item is selected.
  // Otherwise it shows no options
  const locationQuery = locationSearch === location ? '' : locationSearch;

  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations(
    project,
    locationQuery,
  );

  const limitedLocations = locations.slice(0, 1000); // limit the options to 1000 to stop the ui jamming

  return (
    <Container>
      <Text>Preview Options:</Text>
      <ProjectField
        project={selectedProjectOption}
        projects={projects}
        isLoadingProjects={isLoadingProjects}
        onChange={handleSelectProject}
      />
      <LocationField
        disabled={project === null}
        location={selectedLocationOption}
        locations={limitedLocations}
        isLoadingLocations={isLoadingLocations}
        setLocationSearch={setLocationSearch}
        onChange={handleSelectLocation}
      />
    </Container>
  );
};

ProjectField.propTypes = {
  project: PropTypes.string,
  projects: PropTypes.array.isRequired,
  isLoadingProjects: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

ProjectField.defaultProps = {
  project: null,
};

LocationField.propTypes = {
  disabled: PropTypes.bool.isRequired,
  location: PropTypes.string,
  locations: PropTypes.array,
  isLoadingLocations: PropTypes.bool.isRequired,
  setLocationSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

LocationField.defaultProps = {
  location: null,
  locations: [],
};
