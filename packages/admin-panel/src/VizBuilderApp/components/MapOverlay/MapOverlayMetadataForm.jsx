import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete, TextField, useDebounce } from '@tupaia/ui-components';
import Chip from '@material-ui/core/Chip';
import { useCountries, useProjects, useSearchPermissionGroups } from '../../api/queries';
import { useVizConfigContext } from '../../context';
import { MAP_OVERLAY_VIZ_TYPES } from '../../constants';
import { REQUIRED_FIELD_ERROR } from '../../../editor';

export const MapOverlayMetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const vizTypeOptions = Object.entries(MAP_OVERLAY_VIZ_TYPES).map(([vizType, { name }]) => ({
    value: vizType,
    label: name,
  }));

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

  const { handleSubmit, register, errors, control } = useForm({
    mode: 'onChange',
  });
  const [searchInput, setSearchInput] = useState(mapOverlayPermissionGroup || '');
  const debouncedSearchInput = useDebounce(searchInput, 200);
  const { data: permissionGroups = [], isLoading: isLoadingPermissionGroups } =
    useSearchPermissionGroups({ search: debouncedSearchInput });

  const doSubmit = data => {
    setVisualisationValue('code', data.code);
    setVisualisationValue('name', data.name);
    setVisualisationValue('mapOverlayPermissionGroup', data.mapOverlayPermissionGroup);
    setVisualisationValue('reportPermissionGroup', data.mapOverlayPermissionGroup);
    setVisualisationValue('projectCodes', data.projectCodes);
    setVisualisationValue('countryCodes', data.countryCodes);
    setVizType(data.vizType.value);
    if (Object.keys(presentation).length === 0) {
      // If no presentation config exists, set the initial config by vizType
      setPresentation(MAP_OVERLAY_VIZ_TYPES[data.vizType.value].initialConfig);
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
        <Controller
          control={control}
          name="mapOverlayPermissionGroup"
          defaultValue={mapOverlayPermissionGroup}
          rules={{ required: REQUIRED_FIELD_ERROR }}
          render={({ onChange, value, ref, name: inputName }) => (
            <Autocomplete
              id={inputName}
              name={inputName}
              label="Permission group"
              required
              placeholder="Select permission group"
              defaultValue={mapOverlayPermissionGroup}
              options={permissionGroups.map(p => p.name)}
              disabled={isLoadingPermissionGroups}
              error={!!errors.mapOverlayPermissionGroup}
              helperText={
                errors.mapOverlayPermissionGroup && errors.mapOverlayPermissionGroup.message
              }
              inputRef={ref}
              value={value}
              onInputChange={(event, newValue) => {
                setSearchInput(newValue);
              }}
              onChange={(event, newValue) => {
                onChange(newValue);
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="projectCodes"
          defaultValue={inputProjectCodes ?? []}
          render={({ onChange, value, ref, name: inputName }) => (
            <Autocomplete
              id={inputName}
              label="Project codes"
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
              onChange={(thing, selected) => onChange(selected)}
              value={value}
              inputRef={ref}
              name={inputName}
            />
          )}
        />
        <Controller
          control={control}
          name="countryCodes"
          defaultValue={inputCountryCodes ?? []}
          render={({ onChange, value, ref, name: inputName }) => {
            return (
              <Autocomplete
                id={inputName}
                name={inputName}
                label="Country codes"
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
                onChange={(thing, selected) => onChange(selected)}
                value={value}
                inputRef={ref}
              />
            );
          }}
        />

        <Controller
          control={control}
          name="vizType"
          rules={{ required: REQUIRED_FIELD_ERROR }}
          defaultValue={vizTypeOptions.find(option => option.value === vizType)}
          render={({ onChange, value, ref, name: inputName }) => {
            return (
              <Autocomplete
                id={inputName}
                name={inputName}
                label="Visualisation type"
                required
                placeholder="Select visualisation type"
                options={vizTypeOptions}
                getOptionLabel={option => option.label}
                getOptionSelected={option => {
                  return option.value === value;
                }}
                error={!!errors.vizType}
                helperText={errors.vizType && errors.vizType.message}
                inputRef={ref}
                onChange={(event, newValue) => {
                  onChange(newValue);
                }}
                value={value}
              />
            );
          }}
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
