/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Autocomplete, TextField, useDebounce } from '@tupaia/ui-components';
import { useSearchPermissionGroups } from '../../api/queries';
import { useVizConfigContext } from '../../context';
import { DASHBOARD_ITEM_VIZ_TYPES } from '../../constants';

export const DashboardItemMetadataForm = ({ Header, Body, Footer, onSubmit }) => {
  const vizTypeOptions = Object.entries(DASHBOARD_ITEM_VIZ_TYPES).map(([vizType, { name }]) => ({
    value: vizType,
    label: name,
  }));
  const { handleSubmit, register, errors } = useForm();
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
    const selectedVizType = vizTypeOptions.find(({ label }) => label === data.vizType).value;
    setVizType(selectedVizType);
    if (Object.keys(presentation).length === 0) {
      // If no presentation config exists, set the initial config by vizType
      setPresentation(DASHBOARD_ITEM_VIZ_TYPES[selectedVizType].initialConfig);
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
          helperText={errors.code && errors.code.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="name"
          label="Name"
          defaultValue={presentation.name}
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
          value={permissionGroupSearchInput}
          onInputChange={(event, newValue) => {
            setPermissionGroupSearchInput(newValue);
          }}
        />
        <Autocomplete
          id="vizType"
          name="vizType"
          label="Visualisation Type"
          placeholder="Select Visualisation Type"
          defaultValue={vizTypeOptions.find(({ value }) => value === vizType)}
          options={vizTypeOptions}
          getOptionLabel={option => option.label}
          getOptionSelected={option => option.value}
          error={!!errors.vizType}
          helperText={errors.vizType && errors.vizType.message}
          inputRef={register({
            required: 'Required',
          })}
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
