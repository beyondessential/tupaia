/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { IconButton, Typography } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { ActionsMenu } from '@tupaia/ui-components';
import styled from 'styled-components';
import { useEditTask } from '../../api';
import { SmallModal } from '../../components';
import { Task } from '../../types';

const MenuButton = styled(IconButton)`
  &.MuiIconButton-root {
    padding: 0.4rem;
    margin-left: 0;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelTask: () => void;
  isLoading: boolean;
}

const CancelTaskModal = ({ isOpen, onClose, onCancelTask, isLoading }: ModalProps) => (
  <SmallModal
    open={isOpen}
    onClose={onClose}
    title="Cancel task"
    isLoading={isLoading}
    primaryButton={{
      label: 'Cancel task',
      onClick: onCancelTask,
    }}
    secondaryButton={{
      label: 'Go back',
      onClick: onClose,
    }}
  >
    <Typography align="center">
      Are you sure you would like to cancel this task? This cannot be undone.
    </Typography>
  </SmallModal>
);

export const TaskActionsMenu = ({ id, taskStatus }: Task) => {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const { mutate, isLoading } = useEditTask(id, onClose);

  const onCancelTask = () => {
    mutate({ status: TaskStatus.cancelled });
  };

  const actions = [
    {
      label: 'Cancel task',
      action: onOpen,
    },
  ];

  if (taskStatus === TaskStatus.cancelled || taskStatus === TaskStatus.completed) return null;

  return (
    <>
      <ActionsMenu options={actions} IconButton={MenuButton} />
      <CancelTaskModal
        isOpen={isOpen}
        onClose={onClose}
        onCancelTask={onCancelTask}
        isLoading={isLoading}
      />
    </>
  );
};
