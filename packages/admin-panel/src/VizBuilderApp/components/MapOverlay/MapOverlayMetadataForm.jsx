/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Autocomplete, TextField } from '@tupaia/ui-components';
import Chip from '@material-ui/core/Chip';
import { useCountries, useProjects, useSearchPermissionGroups } from '../../api/queries';
import { useVizConfigContext } from '../../context';
import { useDebounce } from '../../../utilities';
import { MAP_OVERLAY_VIZ_TYPES } from '../../constants';
import { REQUIRED_FIELD_ERROR } from '../../../editor';

export const MapOverlayMetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const vizTypeOptions = Object.entries(MAP_OVERLAY_VIZ_TYPES).map(([vizType, { name }]) => ({
    value: vizType,
    label: name,
  }));

  const { handleSubmit, register, errors } = useForm();
  const [{ visualisation, vizType }, { setVisualisationValue, setVizType, setPresentation }] =
    useVizConfigContext();
  const { data: allProjects = [], isLoading: isLoadingAllProjects } = useProjects();
  const { data: allCountries = [], isLoading: isLoadingAllCountries } = useCountries();

  // Save the default values here so that they are frozen from the store when the component first mounts
  const [defaults] = useState(visualisation);
  const {
    name,
    code,
    mapOverlayPermissionGroup,
    projectCodes: inputProjectCodes,
    countryCodes: inputCountryCodes,
    presentation,
  } = defaults;
  const [searchInput, setSearchInput] = useState(mapOverlayPermissionGroup || '');
  const debouncedSearchInput = useDebounce(searchInput, 200);
  const { data: permissionGroups = [], isLoading: isLoadingPermissionGroups } =
    useSearchPermissionGroups({ search: debouncedSearchInput });
  const [projectCodes, setProjectCodes] = useState(inputProjectCodes);
  const [countryCodes, setCountryCodes] = useState(inputCountryCodes);

  const doSubmit = data => {
    setVisualisationValue('code', data.code);
    setVisualisationValue('name', data.name);
    setVisualisationValue('mapOverlayPermissionGroup', data.mapOverlayPermissionGroup);
    setVisualisationValue('reportPermissionGroup', data.mapOverlayPermissionGroup);
    setVisualisationValue('projectCodes', projectCodes);
    setVisualisationValue('countryCodes', countryCodes);
    const selectedVizType = vizTypeOptions.find(({ label }) => label === data.vizType).value;
    setVizType(selectedVizType);
    if (Object.keys(presentation).length === 0) {
      // If no presentation config exists, set the initial config by vizType
      setPresentation(MAP_OVERLAY_VIZ_TYPES[selectedVizType].initialConfig);
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(doSubmit)} noValidate>
      <Header />
      <Body>
        <TextField
          name="code"
          label="Code"
          required
          defaultValue={code}
          error={!!errors.code}
          helperText={errors.code && errors.code.message}
          inputRef={register({
            required: REQUIRED_FIELD_ERROR,
          })}
        />
        <TextField
          name="name"
          label="Name"
          required
          defaultValue={name}
          error={!!errors.name}
          helperText={errors.name && errors.name.message}
          inputRef={register({
            required: REQUIRED_FIELD_ERROR,
          })}
        />
        <Autocomplete
          id="mapOverlayPermissionGroup"
          name="mapOverlayPermissionGroup"
          label="Permission group"
          required
          placeholder="Select permission group"
          defaultValue={mapOverlayPermissionGroup}
          options={permissionGroups.map(p => p.name)}
          disabled={isLoadingPermissionGroups}
          error={!!errors.mapOverlayPermissionGroup}
          helperText={errors.mapOverlayPermissionGroup && errors.mapOverlayPermissionGroup.message}
          inputRef={register({
            required: REQUIRED_FIELD_ERROR,
          })}
          value={searchInput}
          onInputChange={(event, newValue) => {
            setSearchInput(newValue);
          }}
        />
        <Autocomplete
          id="projectCodes"
          name="projectCodes"
          label="Project codes"
          defaultValue={projectCodes ?? []}
          options={allProjects.map(p => p['project.code'])}
          disabled={isLoadingAllProjects}
          error={!!errors.projectCodes}
          helperText={errors.projectCodes && errors.projectCodes.message}
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
          onChange={(thing, selected) => setProjectCodes(selected)}
        />
        <Autocomplete
          id="countryCodes"
          name="countryCodes"
          label="Country codes"
          defaultValue={countryCodes ?? []}
          options={allCountries.map(c => c.code)}
          disabled={isLoadingAllCountries}
          error={!!errors.countryCodes}
          helperText={errors.countryCodes && errors.countryCodes.message}
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
          onChange={(thing, selected) => setCountryCodes(selected)}
        />
        <Autocomplete
          id="vizType"
          name="vizType"
          label="Visualisation type"
          required
          placeholder="Select visualisation type"
          defaultValue={vizTypeOptions.find(({ value }) => value === vizType)}
          options={vizTypeOptions}
          getOptionLabel={option => option.label}
          getOptionSelected={option => option.value}
          error={!!errors.vizType}
          helperText={errors.vizType && errors.vizType.message}
          inputRef={register({
            required: REQUIRED_FIELD_ERROR,
          })}
        />
      </Body>
      <Footer />
    </form>
  );
};

MapOverlayMetadataForm.propTypes = {
  Header: PropTypes.node.isRequired,
  Body: PropTypes.node.isRequired,
  Footer: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
