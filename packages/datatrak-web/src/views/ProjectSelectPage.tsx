/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { SpinningLoader, Button } from '@tupaia/ui-components';
import { DatatrakWebProjectsRequest } from '@tupaia/types';
import { useProjects, useUser } from '../api/queries';
import { useEditUser } from '../api/mutations';
import { SelectList, ListItemType, ButtonLink } from '../components';

export type Project = DatatrakWebProjectsRequest.ResBody[number];

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 20rem;
  flex: 1;
`;

const ListWrapper = styled.div`
  max-height: 35rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const useData = () => {
  const { data: projects, ...projectsQuery } = useProjects();
  const { data: user, ...userQuery } = useUser();
  const isLoading =
    projectsQuery.isLoading ||
    !projectsQuery.isFetched ||
    userQuery.isLoading ||
    !userQuery.isFetched;

  return { projects, user, isLoading };
};

export const ProjectSelectPage = () => {
  const [selectedProject, setSelectedProject] = useState<ListItemType | null>(null);
  const { projects, user, isLoading } = useData();
  const { mutate, isLoading: isConfirming } = useEditUser();

  if (!isLoading && user?.projectId && selectedProject?.value !== user?.projectId) {
    const userProject = projects?.find(({ id }) => id === user?.projectId);
    setSelectedProject({ name: userProject?.entityName, value: userProject?.id });
  }
  const onConfirm = () => {
    mutate({ projectId: selectedProject?.value as Project['id'] });
  };

  const projectOptions = projects?.map(({ entityName, id }: Project) => ({
    name: entityName,
    value: id,
    selected: id === selectedProject?.value,
  }));

  return (
    <Container>
      <Typography variant="h1">Select project {isConfirming && '...'}</Typography>
      {isLoading ? (
        <LoadingContainer>
          <SpinningLoader />
        </LoadingContainer>
      ) : (
        <ListWrapper>
          <SelectList
            items={projectOptions}
            label="Select a project from the list below. You can change the project at any time"
            onSelect={setSelectedProject}
          />
        </ListWrapper>
      )}
      <DialogActions>
        <ButtonLink to="/" variant="outlined">
          Cancel
        </ButtonLink>
        <Button onClick={onConfirm} variant="contained" color="primary" disabled={!selectedProject}>
          Confirm
        </Button>
      </DialogActions>
    </Container>
  );
};
