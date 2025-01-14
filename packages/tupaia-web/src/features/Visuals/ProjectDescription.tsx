import React from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useProject } from '../../api/queries';

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  text-align: center;
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
`;

const SecondaryText = styled(Typography)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  text-align: center;
`;

export const ProjectDescription = () => {
  const { projectCode } = useParams();
  const { data: project, isLoading } = useProject(projectCode);
  if (isLoading) return null;

  const { description, names } = project!;
  if (!description && !names) return <SecondaryText>No project selected</SecondaryText>;
  return (
    <>
      <Title>{description}</Title>
      <SecondaryText>{names.sort().join(', ')}</SecondaryText>
    </>
  );
};
