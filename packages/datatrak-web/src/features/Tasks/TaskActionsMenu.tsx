import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { ActionsMenu } from '@tupaia/ui-components';
import styled from 'styled-components';
import { SingleTaskResponse } from '../../types';
import { useEditTask } from '../../api';
import { CancelTaskModal } from './CancelTaskModal';

const MenuButton = styled(IconButton)`
  &.MuiIconButton-root {
    padding: 0.4rem;
    margin-left: 0;
  }
`;

export const TaskActionsMenu = ({ task }: { task: SingleTaskResponse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const { mutate, isLoading } = useEditTask(task.id, onClose);

  const onCancelTask = () => {
    mutate({ status: TaskStatus.cancelled });
  };

  const actions = [
    {
      label: 'Cancel task',
      action: onOpen,
    },
  ];

  if (task.taskStatus === TaskStatus.cancelled || task.taskStatus === TaskStatus.completed) {
    return null;
  }

  return (
    <>
      <ActionsMenu options={actions} IconButton={MenuButton} />
      <CancelTaskModal
        isOpen={isOpen}
        onClose={onClose}
        onCancelTask={onCancelTask}
        isLoading={isLoading}
        task={task}
      />
    </>
  );
};
