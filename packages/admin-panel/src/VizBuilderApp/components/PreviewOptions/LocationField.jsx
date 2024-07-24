/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';
import { useVizConfigContext } from '../../context';
import { useEntityByCode, useLocations } from '../../api';
import { EntityOptionLabel } from '../../../widgets';

export const LocationField = () => {
  const [locationSearch, setLocationSearch] = useState('');
  const [{ visualisation, project, location }, { setLocation }] = useVizConfigContext();

  const entityCodes = visualisation?.latestDataParameters?.organisationUnitCodes ?? '';

  const firstEntityCode = Array.isArray(entityCodes) ? entityCodes[0] : entityCodes;

  const { data: defaultLocation } = useEntityByCode(firstEntityCode, data => setLocation(data));

  // Show the default options in the dropdown when an item is selected.
  // Otherwise it shows no options
  const locationQuery = locationSearch === location ? '' : locationSearch;

  const { data: locations = [], isLoading: isLoadingLocations } = useLocations(
    project?.['project.code'],
    locationQuery,
  );

  return (
    <Autocomplete
      id="location"
      placeholder="Select Location"
      defaultValue={defaultLocation}
      value={location}
      options={locations}
      loading={isLoadingLocations}
      onInputChange={(_, newValue) => {
        setLocationSearch(newValue);
      }}
      getOptionLabel={option => option.name}
      renderOption={option => {
        return <EntityOptionLabel {...option} />;
      }}
      onChange={(_, newLocation) => {
        setLocation(newLocation);
      }}
      disabled={project === null}
    />
  );
};
