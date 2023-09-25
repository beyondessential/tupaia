/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DialogActions, Typography } from '@material-ui/core';
import { Lock, WatchLater } from '@material-ui/icons';
import { SpinningLoader, Button as UIButton } from '@tupaia/ui-components';
import { Project } from '@tupaia/types';
import { Button, SelectList } from '../components';
import { useEditUser } from '../api/mutations';
import { useProjects } from '../api/queries';
import { ROUTES } from '../constants';

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
  onClose: () => void;
  onRequestAccess?: (projectCode: Project['code']) => void;
}

export const ProjectSelectForm = ({
  projectId,
  onClose,
  variant = 'page',
  onRequestAccess,
}: ProjectSelectFormProps) => {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const { data: projects, isLoading } = useProjects();
  const { mutate, isLoading: isConfirming } = useEditUser(onClose);
  const onConfirm = () => {
    mutate({ projectId: selectedProjectId! });
  };

  const handleRequestAccess = project => {
    if (variant === 'modal' && onRequestAccess) {
      onRequestAccess(project.code);
    } else {
      navigate({
        pathname: ROUTES.REQUEST_ACCESS,
        search: `?project=${project?.code}`,
      });
    }
  };

  const onSelect = project => {
    if (project.hasAccess) {
      setSelectedProjectId(project.value);
    } else {
      handleRequestAccess(project);
    }
  };

  const getProjectIcon = (hasAccess: boolean, hasPendingAccess: boolean) => {
    if (hasPendingAccess) return <WatchLater />;
    if (!hasAccess) return <Lock />;
    return null;
  };

  const getProjectTooltip = (hasAccess: boolean, hasPendingAccess: boolean) => {
    if (hasPendingAccess) return 'Approval in progress';
    if (!hasAccess) return 'Request project access';
    return '';
  };

  const getFormattedProjects = () => {
    return projects?.map(({ name, code, hasAccess, id, hasPendingAccess }) => {
      const icon = getProjectIcon(hasAccess, hasPendingAccess);
      const tooltip = getProjectTooltip(hasAccess, hasPendingAccess);
      return {
        content: name,
        value: id,
        code,
        selected: id === selectedProjectId,
        icon,
        tooltip,
        button: !hasPendingAccess,
        disabled: hasPendingAccess,
        hasAccess,
      };
    });
  };

  const projectOptions = getFormattedProjects();

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
