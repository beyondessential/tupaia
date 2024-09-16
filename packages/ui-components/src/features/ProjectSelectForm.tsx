/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { KeysToCamelCase, Entity, Project as ProjectT } from '@tupaia/types';
import { DialogActions, Typography } from '@material-ui/core';
import { Lock as LockIcon, WatchLater as ClockIcon } from '@material-ui/icons';
import { SpinningLoader, Button as UIButton } from '../components';
import { Button, SelectList } from '../components';

type Project = KeysToCamelCase<ProjectT> & {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: Entity['code'];
  name: Entity['name'];
  names?: Entity['name'][];
  value: string;
};

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

  // Keep body text styling, even if component is child of a paragraph/heading
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.01071em;

  max-block-size: ${({ $variant }) => ($variant === 'modal' ? 'none' : '35rem')};
  ${({ theme }) => theme.breakpoints.up('sm')} {
    max-block-size: 35rem;
  }
`;

interface ProjectSelectFormProps {
  projectId?: Project['id'];
  variant?: 'modal' | 'page';
  onClose: () => void;
  onRequestAccess: (projectCode: Project['code']) => void;
  projects?: Project[];
  isLoading: boolean;
  onConfirm: (data: Record<string, any>) => void;
  isConfirming: boolean;
}

export const ProjectSelectForm = ({
  projectId,
  onClose,
  variant = 'page',
  onRequestAccess,
  projects,
  isLoading,
  onConfirm,
  isConfirming,
}: ProjectSelectFormProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);

  const onSelect = (project: any) => {
    if (project.hasAccess) {
      setSelectedProjectId(project.value);
    } else {
      onRequestAccess(project.code);
    }
  };

  const handleConfirm = () => {
    onConfirm({ projectId: selectedProjectId! });
  };

  const getProjectIcon = (hasAccess: boolean, hasPendingAccess: boolean) => {
    if (hasPendingAccess) return <ClockIcon />;
    if (!hasAccess) return <LockIcon />;
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
          onClick={handleConfirm}
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
