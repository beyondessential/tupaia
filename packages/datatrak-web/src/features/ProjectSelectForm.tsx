/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { DialogActions, Typography } from '@material-ui/core';
import { Lock } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import { SpinningLoader, Button as UIButton, Tooltip } from '@tupaia/ui-components';
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

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 1.5rem;
`;

const StyledListItem = styled(BaseListItem)<{
  $hasAccess: boolean;
}>`
  color: ${({ theme, $hasAccess }) =>
    $hasAccess ? theme.palette.text.primary : theme.palette.text.secondary};

  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const ListItem = ({ item, onSelect }) => {
  const { name, selected, hasAccess } = item;
  const onClick = () => {
    return onSelect(item);
  };

  const Item = (
    <StyledListItem button onClick={onClick} selected={selected} $hasAccess={hasAccess}>
      <IconWrapper>{!hasAccess && <Lock />}</IconWrapper>
      {name}
    </StyledListItem>
  );

  if (hasAccess) {
    return Item;
  }

  return (
    <Tooltip title="Request project access" arrow>
      {Item}
    </Tooltip>
  );
};

interface ProjectSelectFormProps {
  projectId?: Project['id'];
  variant?: 'modal' | 'page';
  onClose: () => void;
}

export const ProjectSelectForm = ({
  projectId,
  onClose,
  variant = 'page',
}: ProjectSelectFormProps) => {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const { data: projects, isLoading } = useProjects();
  const { mutate, isLoading: isConfirming } = useEditUser(onClose);

  const projectOptions = projects?.map(({ entityName, id }, index) => ({
    name: entityName,
    value: id,
    selected: id === selectedProjectId,
    hasAccess: index < 6,
  }));

  const onConfirm = () => {
    const selectedProject = projectOptions?.find(({ selected }) => selected);
    if (!selectedProject?.hasAccess) {
      navigate('request-access');
      return onClose();
    }
    mutate({ projectId: selectedProjectId! });
  };

  const onSelect = project => {
    setSelectedProjectId(project.value);
  };

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
          <UIButton onClick={onClose} variant="outlined">
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
