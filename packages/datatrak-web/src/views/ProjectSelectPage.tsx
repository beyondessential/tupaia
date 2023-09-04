/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { SpinningLoader, Button } from '@tupaia/ui-components';
import { DatatrakWebProjectsRequest } from '@tupaia/types';
import { useProjects } from '../api/queries';
import { useEditUser } from '../api/mutations';
import { SelectList, ListItemType, ButtonLink } from '../components';
import { HEADER_HEIGHT } from '../constants';

export type Project = DatatrakWebProjectsRequest.ResBody[number];

const Container = styled(Paper)`
  width: 48rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - ${HEADER_HEIGHT} - 4rem) !important;
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

export const ProjectSelectPage = () => {
  const { data, isLoading, isFetched } = useProjects();
  const [selectedProject, setSelectedProject] = useState<ListItemType | null>(null);
  const showLoader = isLoading || !isFetched;
  const { mutate, isLoading: isConfirming } = useEditUser();

  const projectOptions = data?.map(({ entityName, id }: Project) => ({
    name: entityName,
    value: id,
    selected: id === selectedProject?.value,
  }));

  const onConfirm = () => {
    mutate({ projectId: selectedProject?.value });
  };

  return (
    <Container>
      <Typography variant="h1">Select project {isConfirming && '...'}</Typography>
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
        <Button onClick={onConfirm} variant="contained" color="primary" disabled={!selectedProject}>
          Confirm
        </Button>
      </DialogActions>
    </Container>
  );
};
