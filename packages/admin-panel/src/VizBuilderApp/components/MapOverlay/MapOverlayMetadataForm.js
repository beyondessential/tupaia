/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Autocomplete, MultiSelect, TextField } from '@tupaia/ui-components';
import { useCountries, usePermissionGroups, useProjects } from '../../api/queries';
import { useVizBuilderConfig } from '../../context';

export const MapOverlayMetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const { handleSubmit, register, errors } = useForm();
  const [{ visualisation }, { setVisualisationValue }] = useVizBuilderConfig();
  const {
    data: permissionGroups = [],
    isLoading: isLoadingPermissionGroups,
  } = usePermissionGroups();
  const { data: allProjects = [], isLoading: isLoadingAllProjects } = useProjects();
  const { data: allCountries = [], isLoading: isLoadingAllCountries } = useCountries();

  // Save the default values here so that they are frozen from the store when the component first mounts
  const [defaults] = useState(visualisation);
  const { name, code, mapOverlayPermissionGroup, projectCodes, countryCodes } = defaults;

  const doSubmit = data => {
    setVisualisationValue('code', data.code);
    setVisualisationValue('name', data.name);
    setVisualisationValue('mapOverlayPermissionGroup', data.mapOverlayPermissionGroup);
    setVisualisationValue('projectCodes', data.projectCodes);
    setVisualisationValue('countryCodes', data.countryCodes);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(doSubmit)} noValidate>
      <Header />
      <Body>
        <TextField
          name="code"
          label="Code"
          defaultValue={code}
          error={!!errors.code}
          helperText={errors.code && errors.code.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="name"
          label="Name"
          defaultValue={name}
          error={!!errors.name}
          helperText={errors.name && errors.name.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <Autocomplete
          id="mapOverlayPermissionGroup"
          name="mapOverlayPermissionGroup"
          label="Permission Group"
          placeholder="Select Permission Group"
          defaultValue={mapOverlayPermissionGroup}
          options={permissionGroups.map(p => p.name)}
          disabled={isLoadingPermissionGroups}
          error={!!errors.mapOverlayPermissionGroup}
          helperText={errors.mapOverlayPermissionGroup && errors.mapOverlayPermissionGroup.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <MultiSelect
          id="projectCodes"
          name="projectCodes"
          label="Project Codes"
          placeholder="Select Project Codes"
          defaultValue={projectCodes ?? []}
          options={allProjects.map(p => ({ label: p['project.code'], value: p['project.code'] }))}
          disabled={isLoadingAllProjects}
          error={!!errors.projectCodes}
          helperText={errors.projectCodes && errors.projectCodes.message}
        />
        <MultiSelect
          id="countryCodes"
          name="countryCodes"
          label="Country Codes"
          placeholder="Select Country Codes"
          defaultValue={countryCodes ?? []}
          options={allCountries.map(c => ({ label: c.code, value: c.code }))}
          disabled={isLoadingAllCountries}
          error={!!errors.countryCodes}
          helperText={errors.countryCodes && errors.countryCodes.message}
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
