/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Autocomplete, TextField } from '@tupaia/ui-components';
import { usePermissionGroups, useProjects } from '../api/queries';
import { useStore } from '../store';

export const MetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const { handleSubmit, register, errors } = useForm();
  const [state, { setValue, setProject }] = useStore();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const {
    data: permissionGroups = [],
    isLoading: isLoadingPermissionGroups,
  } = usePermissionGroups();

  // Save the default values here so that they are frozen from the store when the component first mounts
  const [defaults] = useState(state);
  const { name, permissionGroup, project, summary } = defaults;

  const doSubmit = data => {
    setValue('name', data.name);
    setValue('summary', data.summary);
    setValue('permissionGroup', data.permissionGroup);
    setProject(data.project);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(doSubmit)} noValidate>
      <Header />
      <Body>
        <Autocomplete
          id="project"
          name="project"
          label="Project"
          placeholder="Select Project"
          defaultValue={project}
          options={projects.map(p => p.code)}
          disabled={isLoadingProjects}
          error={!!errors.project}
          helperText={errors.project && errors.project.message}
          inputRef={register({
            required: 'Required',
          })}
        />
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
          name="textArea"
          label="Summary"
          defaultValue={summary}
          multiline
          rows="4"
          inputRef={register()}
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
