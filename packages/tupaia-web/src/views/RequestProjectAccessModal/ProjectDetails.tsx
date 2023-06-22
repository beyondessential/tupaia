/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { SingleProject } from '../../types';
import { Typography, Divider } from '@material-ui/core';

const Wrapper = styled.div`
  margin: 2.25rem 0;
  text-align: left;
`;

const ProjectTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 0.3rem 0;
`;

const Countries = styled(Typography)`
  margin: 0.6rem 0 1.4rem;
  font-size: 0.875rem;
  opacity: 0.7;
  text-transform: uppercase;
`;

interface ProjectDetailsProps {
  project?: SingleProject;
}

export const ProjectDetails = ({ project }: ProjectDetailsProps) => {
  return (
    <Wrapper>
      <ProjectTitle>{project?.name}</ProjectTitle>
      <Typography>{project?.description}</Typography>
      {project?.names && <Countries>{project.names.join(', ')}</Countries>}
      <Divider />
    </Wrapper>
  );
};
