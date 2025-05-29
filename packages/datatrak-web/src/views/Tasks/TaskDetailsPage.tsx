import React, { useState } from 'react';
import { generatePath, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { useNavigate } from 'react-router';
import { Modal, ModalCenteredContent, SpinningLoader } from '@tupaia/ui-components';
import { Button } from '../../components';
import { TaskDetails, TaskPageHeader, TaskActionsMenu } from '../../features';
import { useTask } from '../../api';
import { PRIMARY_ENTITY_CODE_PARAM, ROUTES } from '../../constants';
import { useFromLocation, useIsMobile } from '../../utils';
import { SingleTaskResponse } from '../../types';
import { StickyMobileHeader, TasksContentWrapper } from '../../layout';

const ContentWrapper = styled(TasksContentWrapper)`
  padding-block-end: 2rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-inline: 2.2rem;
  }

  ${({ theme }) => theme.breakpoints.down('xs')} {
    padding-inline: 0.2rem 0;
  }
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

  const { entity, survey, surveyResponseId, taskStatus } = task;

  const surveyUrl = generatePath(ROUTES.SURVEY_SCREEN, {
    countryCode: entity?.countryCode,
    surveyCode: survey?.code,
    screenNumber: '1',
  });
  const surveyLink = `${surveyUrl}?${PRIMARY_ENTITY_CODE_PARAM}=${entity?.code}`;

  if (taskStatus === TaskStatus.cancelled) return null;
  if (taskStatus === TaskStatus.completed) {
    if (!surveyResponseId)
      return (
        <Button onClick={openErrorModal} variant="outlined">
          View completed survey
        </Button>
      );
    return (
      <Button to={`?responseId=${surveyResponseId}`} variant="outlined">
        View completed survey
      </Button>
    );
  }
  return (
    <Button to={surveyLink} state={{ from }}>
      Complete task
    </Button>
  );
};

export const TaskDetailsPage = () => {
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const { taskId } = useParams();
  const { data: task, isLoading } = useTask(taskId);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile && (
        <StickyMobileHeader title="Tasks" onBack={() => navigate(ROUTES.TASKS)}>
          Task details
        </StickyMobileHeader>
      )}
      <TaskPageHeader title="Task details" backTo={ROUTES.TASKS}>
        <ButtonWrapper>
          <ButtonComponent task={task} openErrorModal={() => setErrorModalOpen(true)} />
          {task && <TaskActionsMenu task={task} />}
        </ButtonWrapper>
      </TaskPageHeader>
      <ContentWrapper>
        {isLoading && <SpinningLoader />}
        {task && <TaskDetails task={task} />}
        <ErrorModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} />
      </ContentWrapper>
    </>
  );
};
