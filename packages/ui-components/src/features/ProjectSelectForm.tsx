import { DialogActions, useTheme } from '@material-ui/core';
import { WatchLater as ClockIcon, Lock as LockIcon } from '@material-ui/icons';
import React, { useState } from 'react';
import styled from 'styled-components';

import { Entity, KeysToCamelCase, Project as ProjectT } from '@tupaia/types';
import {
  SelectList,
  SpinningLoader,
  Button as UIButton,
  ButtonProps as UIButtonProps,
} from '../components';
import { OfflineErrorMessage } from '../components/OfflineErrorMessage';

const Button = styled(UIButton)`
  font-size: 0.875rem;
  padding-block: 0.5rem;
  padding-inline: 1.6rem;
  text-transform: none;
`;

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

const OfflineErrorMessageContainer = styled.div`
  margin-top: 2rem;
`;

const CancelButton = (props: UIButtonProps) => {
  const isLightTheme = useTheme().palette.type === 'light';
  return (
    <Button
      color={isLightTheme ? 'primary' : 'default'}
      variant={isLightTheme ? 'outlined' : 'text'}
      {...props}
    />
  );
};

interface Project extends KeysToCamelCase<ProjectT> {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: Entity['code'];
  name: Entity['name'];
  names?: Entity['name'][];
  value?: string;
}

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

  const isOnline = window.navigator.onLine;

  if (!isOnline) {
    return (
      <OfflineErrorMessageContainer>
        <OfflineErrorMessage offlineMessage="You'll need an internet connection to select a project. Come back when you're connected and try again." />
        <DialogActions>
          <Button onClick={onClose}>Back</Button>
        </DialogActions>
      </OfflineErrorMessageContainer>
    );
  }

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

  return (
    <>
      {isLoading ? (
        <LoadingContainer>
          <SpinningLoader />
        </LoadingContainer>
      ) : (
        <ListWrapper $variant={variant}>
          <SelectList
            items={getFormattedProjects()}
            label="Select a project from the list below. You can change the project at any time"
            onSelect={onSelect}
          />
        </ListWrapper>
      )}
      <DialogActions>
        {variant === 'modal' && <CancelButton onClick={onClose}>Cancel</CancelButton>}
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
