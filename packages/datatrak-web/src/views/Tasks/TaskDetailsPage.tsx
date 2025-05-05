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

const StyledButton = styled(Button)`
  ${props => props.theme.breakpoints.up('md')} {
    margin-inline-end: auto;
  }
`;

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

  if (taskStatus === TaskStatus.cancelled) return null;

  const surveyUrl = generatePath(ROUTES.SURVEY_SCREEN, {
    countryCode: entity?.countryCode,
    surveyCode: survey?.code,
    screenNumber: '1',
  });
  const surveyLink = `${surveyUrl}?${PRIMARY_ENTITY_CODE_PARAM}=${entity?.code}`;

  if (taskStatus === TaskStatus.completed) {
    if (!surveyResponseId)
      return (
        <StyledButton onClick={openErrorModal} variant="outlined">
          View completed survey
        </StyledButton>
      );
    return (
      <StyledButton to={`?responseId=${surveyResponseId}`} variant="outlined">
        View completed survey
      </StyledButton>
    );
  }
  return (
    <StyledButton to={surveyLink} state={{ from }}>
      Complete task
    </StyledButton>
  );
};

export const TaskDetailsPage = () => {
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const { taskId } = useParams();
  const { data: task, isLoading } = useTask(taskId);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const onBack = () => {
    navigate(-1);
  };

  return (
    <>
      {isMobile && (
        <StickyMobileHeader onBack={onBack}>
          <Typography variant="h1">Task details</Typography>
          <Typography variant="body2" color="textSecondary">
            {task?.survey?.name}
          </Typography>
        </StickyMobileHeader>
      )}
      <TaskPageHeader title="Task details" backTo={ROUTES.TASKS}>
        <ButtonComponent task={task} openErrorModal={() => setErrorModalOpen(true)} />
        {task && <TaskActionsMenu task={task} />}
      </TaskPageHeader>
      <ContentWrapper>
        {isLoading && <SpinningLoader />}
        {task && <TaskDetails task={task} />}
        <ErrorModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} />
      </ContentWrapper>
    </>
  );
};
