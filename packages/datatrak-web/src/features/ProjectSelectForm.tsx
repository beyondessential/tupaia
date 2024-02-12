/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DialogActions, Typography } from '@material-ui/core';
import { Lock, WatchLater as Clock } from '@material-ui/icons';
import { Button as UIButton, SpinningLoader } from '@tupaia/ui-components';
import { Project } from '@tupaia/types';
import { Button, SelectList } from '../components';
import { useEditUser, useProjects } from '../api';
import { ROUTES } from '../constants';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 20rem;
  flex: 1;
`;

const ListWrapper = styled.div<{
  $variant?: 'modal' | 'page';
}>`
  display: flex;
  flex-direction: column;
  overflow: auto;

  max-block-size: ${({ $variant }) => ($variant === 'modal' ? 'none' : '35rem')};
  ${({ theme }) => theme.breakpoints.up('sm')} {
    max-block-size: 35rem;
  }

  // Keep body text styling, even if component is child of a paragraph/heading
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.01071em;
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
    if (hasPendingAccess) return <Clock />;
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
        <ListWrapper $variant={variant}>
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
          tooltip={selectedProjectId ? undefined : 'Select a project to proceed'}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
};
