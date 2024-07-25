/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { generatePath, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { Modal, ModalCenteredContent, SpinningLoader } from '@tupaia/ui-components';
import { Button } from '../../components';
import { TaskDetails, TaskPageHeader, TaskActionsMenu } from '../../features';
import { useTask } from '../../api';
import { ROUTES } from '../../constants';
import { useFromLocation } from '../../utils';
import { SingleTaskResponse } from '../../types';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
`;

const ErrorModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      title="Error loading survey response"
      isOpen={isOpen}
      onClose={onClose}
      buttons={[
        {
          text: 'Close',
          onClick: onClose,
          id: 'close',
        },
      ]}
    >
      <ModalCenteredContent>
        <Typography>
          This response has since been deleted in the admin panel. Please contact your system
          administrator for further questions.
        </Typography>
      </ModalCenteredContent>
    </Modal>
  );
};

const ButtonComponent = ({
  task,
  openErrorModal,
}: {
  task?: SingleTaskResponse;
  openErrorModal: () => void;
}) => {
  const from = useFromLocation();

  if (!task) return null;

  const surveyUrl = task
    ? generatePath(ROUTES.SURVEY_SCREEN, {
        countryCode: task?.entity?.countryCode,
        surveyCode: task?.survey?.code,
        screenNumber: '1',
      })
    : '';

  if (task.taskStatus === TaskStatus.cancelled) return null;
  if (task.taskStatus === TaskStatus.completed) {
    if (!task.surveyResponseId)
      return (
        <Button onClick={openErrorModal} variant="outlined">
          View completed survey
        </Button>
      );
    return (
      <Button to={`?responseId=${task.surveyResponseId}`} variant="outlined">
        View completed survey
      </Button>
    );
  }
  return (
    <Button to={surveyUrl} state={{ from }}>
      Complete task
    </Button>
  );
};

export const TaskDetailsPage = () => {
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const { taskId } = useParams();
  const { data: task, isLoading } = useTask(taskId);

  return (
    <>
      <TaskPageHeader title="Task details">
        <ButtonWrapper>
          <ButtonComponent task={task} openErrorModal={() => setErrorModalOpen(true)} />
          {task && <TaskActionsMenu {...task} />}
        </ButtonWrapper>
      </TaskPageHeader>
      {isLoading && <SpinningLoader />}
      {task && <TaskDetails task={task} />}
      <ErrorModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} />
    </>
  );
};
