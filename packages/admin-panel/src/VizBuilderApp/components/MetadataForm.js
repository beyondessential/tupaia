/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Autocomplete, TextField } from '@tupaia/ui-components';
import { usePermissionGroups } from '../api/queries';
import { useVizBuilderConfig } from '../context';

export const MetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const { handleSubmit, register, errors } = useForm();
  const [{ visualisation }, { setVisualisationValue }] = useVizBuilderConfig();
  const {
    data: permissionGroups = [],
    isLoading: isLoadingPermissionGroups,
  } = usePermissionGroups();

  // Save the default values here so that they are frozen from the store when the component first mounts
  const [defaults] = useState(visualisation);
  const { name, code, permissionGroup } = defaults;

  const doSubmit = data => {
    setVisualisationValue('name', data.name);
    setVisualisationValue('code', data.code);
    setVisualisationValue('permissionGroup', data.permissionGroup);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(doSubmit)} noValidate>
      <Header />
      <Body>
        <Autocomplete
          id="permissionGroup"
          name="permissionGroup"
          label="Permission Group"
          placeholder="Select Permission Group"
          defaultValue={permissionGroup}
          options={permissionGroups.map(p => p.name)}
          disabled={isLoadingPermissionGroups}
          error={!!errors.permissionGroup}
          helperText={errors.permissionGroup && errors.permissionGroup.message}
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
      </Body>
      <Footer />
    </form>
  );
};

MetadataForm.propTypes = {
  Header: PropTypes.any.isRequired,
  Body: PropTypes.any.isRequired,
  Footer: PropTypes.any.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
