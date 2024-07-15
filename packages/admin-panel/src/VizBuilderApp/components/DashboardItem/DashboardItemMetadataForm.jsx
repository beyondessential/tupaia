/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete, TextField, useDebounce } from '@tupaia/ui-components';
import { useSearchPermissionGroups } from '../../api/queries';
import { useVizConfigContext } from '../../context';
import { DASHBOARD_ITEM_VIZ_TYPES } from '../../constants';
import { REQUIRED_FIELD_ERROR } from '../../../editor/validation';

export const DashboardItemMetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const vizTypeOptions = Object.entries(DASHBOARD_ITEM_VIZ_TYPES).map(([vizType, { name }]) => ({
    value: vizType,
    label: name,
  }));
  const { handleSubmit, register, errors, control } = useForm({
    mode: 'onChange',
  });

  const [
    { visualisation, vizType },
    { setVisualisationValue, setVizType, setPresentation, setPresentationValue },
  ] = useVizConfigContext();

  // Save the default values here so that they are frozen from the store when the component first mounts
  const [defaults] = useState(visualisation);
  const { code, permissionGroup, presentation } = defaults;
  const [permissionGroupSearchInput, setPermissionGroupSearchInput] = useState(
    permissionGroup || '',
  );
  const debouncedPermissionGroupSearchInput = useDebounce(permissionGroupSearchInput, 200);
  const { data: permissionGroups = [], isLoading: isLoadingPermissionGroups } =
    useSearchPermissionGroups({ search: debouncedPermissionGroupSearchInput });

  const doSubmit = data => {
    setVisualisationValue('code', data.code);
    setVisualisationValue('permissionGroup', data.permissionGroup);
    setVizType(data.vizType.value);
    if (Object.keys(presentation).length === 0) {
      // If no presentation config exists, set the initial config by vizType
      setPresentation(DASHBOARD_ITEM_VIZ_TYPES[data.vizType.value].initialConfig);
    }
    setPresentationValue('name', data.name);
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
          required
          helperText={errors.code && errors.code.message}
          inputRef={register({
            required: REQUIRED_FIELD_ERROR,
          })}
        />
        <TextField
          name="name"
          label="Name"
          required
          defaultValue={presentation.name}
          error={!!errors.name}
          helperText={errors.name && errors.name.message}
          inputRef={register({
            required: REQUIRED_FIELD_ERROR,
          })}
        />
        <Controller
          name="permissionGroup"
          control={control}
          required
          defaultValue={permissionGroup}
          rules={{ required: REQUIRED_FIELD_ERROR }}
          render={({ onChange, value, ref, name }) => {
            return (
              <Autocomplete
                id={name}
                name={name}
                label="Permission group"
                required
                placeholder="Select permission group"
                defaultValue={permissionGroup}
                options={permissionGroups.map(p => p.name)}
                disabled={isLoadingPermissionGroups}
                error={!!errors.permissionGroup}
                helperText={errors.permissionGroup && errors.permissionGroup.message}
                inputRef={ref}
                inputValue={permissionGroupSearchInput}
                onInputChange={(event, newValue) => {
                  setPermissionGroupSearchInput(newValue);
                }}
                onChange={(event, newValue) => {
                  onChange(newValue);
                }}
                value={value}
              />
            );
          }}
        />
        <Controller
          name="vizType"
          control={control}
          required
          defaultValue={vizTypeOptions.find(({ value: optionValue }) => optionValue === vizType)}
          rules={{ required: REQUIRED_FIELD_ERROR }}
          render={({ onChange, value, ref, name }) => (
            <Autocomplete
              id={name}
              name={name}
              required
              label="Visualisation type"
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
          )}
        />
      </Body>
      <Footer />
    </form>
  );
};

DashboardItemMetadataForm.propTypes = {
  Header: PropTypes.node.isRequired,
  Body: PropTypes.node.isRequired,
  Footer: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
