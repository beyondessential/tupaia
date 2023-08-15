/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Autocomplete as BaseAutocomplete } from '@tupaia/ui-components';
import { ButtonLink } from '../components';
import { useEntities, useProjects } from '../api/queries';
import styled from 'styled-components';

const Autocomplete = styled(BaseAutocomplete)`
  margin-bottom: 30px;

  .MuiFormLabel-root {
    font-weight: 500;
    margin-bottom: 10px;
    font-size: 24px;
    line-height: 28px;
    color: #4e3838;
  }
`;

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

  const [entity, setEntity] = useState(null);
  const { data: entities = [] } = useEntities(project, 'facility');
  const entityOptions = entities.map(c => ({
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
      {country !== null ? (
        <Autocomplete
          label="Select a facility"
          options={entityOptions}
          getOptionLabel={option => option.label}
          onChange={(e, { value }) => setEntity(value)}
        />
      ) : null}
      <ButtonLink to={`/${project}/${country}/${entity}/surveys`}>Next</ButtonLink>
    </div>
  );
};
