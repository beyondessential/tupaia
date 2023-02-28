/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Autocomplete, TextField } from '@tupaia/ui-components';
import { useSearchPermissionGroups } from '../../api/queries';
import { useVizConfig } from '../../context';
import { useDebounce } from '../../../utilities';

export const DashboardMetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const { handleSubmit, register, errors } = useForm();
  const [{ visualisation }, { setVisualisationValue }] = useVizConfig();

  // Save the default values here so that they are frozen from the store when the component first mounts
  const [defaults] = useState(visualisation);
  const { name, code, permissionGroup } = defaults;
  const [searchInput, setSearchInput] = useState(permissionGroup || '');
  const debouncedSearchInput = useDebounce(searchInput, 200);
  const { data: permissionGroups = [], isLoading: isLoadingPermissionGroups } =
    useSearchPermissionGroups({ search: debouncedSearchInput });

  const doSubmit = data => {
    setVisualisationValue('code', data.code);
    setVisualisationValue('name', data.name);
    setVisualisationValue('permissionGroup', data.permissionGroup);
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
          value={searchInput}
          onInputChange={(event, newValue) => {
            setSearchInput(newValue);
          }}
        />
      </Body>
      <Footer />
    </form>
  );
};

DashboardMetadataForm.propTypes = {
  Header: PropTypes.node.isRequired,
  Body: PropTypes.node.isRequired,
  Footer: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
