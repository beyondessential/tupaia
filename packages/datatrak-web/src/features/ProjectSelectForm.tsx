/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { DialogActions, Typography } from '@material-ui/core';
import { Lock } from '@material-ui/icons';
import { SpinningLoader, Button as UIButton } from '@tupaia/ui-components';
import { Project } from '@tupaia/types';
import { Button, SelectList, BaseListItem } from '../components';
import { useEditUser } from '../api/mutations';
import { useProjects } from '../api/queries';

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

interface ProjectSelectFormProps {
  projectId?: Project['id'];
  variant?: 'modal' | 'page';
  onSuccess: () => void;
}

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 1.5rem;
`;
const ListItem = ({ item, onSelect }) => {
  const onClick = () => {
    return onSelect ? onSelect(item) : null;
  };
  return (
    <BaseListItem button onClick={onClick} selected={item.selected}>
      <IconWrapper>
        <Lock color="primary" />
      </IconWrapper>
      {item.name}
    </BaseListItem>
  );
};

export const ProjectSelectForm = ({
  projectId,
  onSuccess,
  variant = 'page',
}: ProjectSelectFormProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const { data: projects, isLoading } = useProjects();
  const { mutate, isLoading: isConfirming } = useEditUser(onSuccess);
  const onConfirm = () => {
    mutate({ projectId: selectedProjectId! });
  };

  const onSelect = project => {
    setSelectedProjectId(project.value);
  };

  const projectOptions = projects?.map(({ entityName, id }) => ({
    name: entityName,
    value: id,
    selected: id === selectedProjectId,
  }));

  return (
    <>
      <Typography variant="h1">Select project</Typography>
      {isLoading ? (
        <LoadingContainer>
          <SpinningLoader />
        </LoadingContainer>
      ) : (
        <ListWrapper>
          <SelectList
            ListItem={ListItem}
            items={projectOptions}
            label="Select a project from the list below. You can change the project at any time"
            onSelect={onSelect}
          />
        </ListWrapper>
      )}
      <DialogActions>
        {variant === 'modal' && (
          <UIButton onClick={onSuccess} variant="outlined">
            Cancel
          </UIButton>
        )}
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          isLoading={isConfirming}
          disabled={!selectedProjectId}
          tooltip={selectedProjectId ? '' : 'Select project to proceed'}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
};
