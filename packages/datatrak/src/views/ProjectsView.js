/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Autocomplete } from '@tupaia/ui-components';
import { FlexColumn } from '../components';
import { useEntities, useProjects } from '../api/queries';

const Container = styled(FlexColumn)`
  padding: 1rem;
  background: white;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
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

  return (
    <Container>
      <Title>Projects View</Title>
      <Autocomplete
        label="Project"
        options={projectOptions}
        getOptionLabel={option => option.label}
        onChange={(e, { value }) => setProject(value)}
      />
      {project !== null ? (
        <Autocomplete
          label="Country"
          options={countryOptions}
          getOptionLabel={option => option.label}
          onChange={(e, { value }) => setCountry(value)}
        />
      ) : null}
      <Link to={`/${project}/${country}/surveys`}>Next</Link>
    </Container>
  );
};
