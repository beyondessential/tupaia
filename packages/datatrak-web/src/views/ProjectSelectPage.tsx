/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { useProjects } from '../api/queries';
import { SelectList, ListItemType, ButtonLink } from '../components';
import { DatatrakWebProjectsRequest } from '@tupaia/types';

export type Project = DatatrakWebProjectsRequest.ResBody[number];

const Container = styled(Paper)`
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
`;

export const ProjectSelectPage = () => {
  const { data, isLoading, isFetched } = useProjects();
  const [selectedProject, setSelectedProject] = useState<ListItemType | null>(null);
  const showLoader = isLoading || !isFetched;

  const projectOptions = data?.map(({ entityName, id }: Project) => ({
    name: entityName,
    value: id,
    selected: id === selectedProject?.value,
  }));

  return (
    <Container>
      <Typography variant="h1">Select project</Typography>
      {showLoader ? (
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
        <ButtonLink
          to={`${selectedProject?.value}/1` || ''}
          variant="contained"
          color="primary"
          disabled={!selectedProject}
        >
          Confirm
        </ButtonLink>
      </DialogActions>
    </Container>
  );
};
