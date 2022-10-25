/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Autocomplete } from '@tupaia/ui-components';
import { ButtonLink } from '../components';
import { useEntities, useProjects } from '../api/queries';

export const ProjectsView = () => {
  const [project, setProject] = useState(null);
  const { data: projects = [] } = useProjects();
  const projectOptions = projects.map(p => ({
    value: p.code,
    label: p['entity.name'],
  }));

  const [country, setCountry] = useState(null);
  const { data: countries = [] } = useEntities(project, 'country');
  const countryOptions = countries.map(c => ({
    value: c.code,
    label: c.name,
  }));

  return (
    <div>
      <Autocomplete
        label="Select a project"
        options={projectOptions}
        getOptionLabel={option => option.label}
        onChange={(e, { value }) => setProject(value)}
      />
      {project !== null ? (
        <Autocomplete
          label="Select a country"
          options={countryOptions}
          getOptionLabel={option => option.label}
          onChange={(e, { value }) => setCountry(value)}
        />
      ) : null}
      <ButtonLink to={`/${project}/${country}/surveys`}>Next</ButtonLink>
    </div>
  );
};
