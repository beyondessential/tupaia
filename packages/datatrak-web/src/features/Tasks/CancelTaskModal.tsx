/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Typography } from '@material-ui/core';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';
import styled from 'styled-components';
import { TaskSummary } from './TaskSummary';
import { SingleTaskResponse } from '../../types';

const Container = styled(ModalCenteredContent)`
  width: 27rem;
  max-width: 100%;
  margin: 0 auto;
  padding-block: 2rem;
`;

interface CancelTaskModalProps {
  task: SingleTaskResponse;
  isOpen: boolean;
  onClose: () => void;
  onCancelTask: () => void;
  isLoading: boolean;
}
export const CancelTaskModal = ({
  task,
  isOpen,
  onClose,
  onCancelTask,
  isLoading,
}: CancelTaskModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Cancel task"
    isLoading={isLoading}
    buttons={[
      {
        text: 'Go back',
        onClick: onClose,
        id: 'save',
        type: 'submit',
        variant: 'outlined',
        disabled: isLoading,
      },
      {
        text: 'Cancel task',
        onClick: onCancelTask,
        id: 'cancel',
        disabled: isLoading,
      },
    ]}
  >
    <Container>
      <TaskSummary task={task} />
      <Typography>
        Are you sure you would like to cancel this task? This cannot be undone.
      </Typography>
    </Container>
  </Modal>
);
