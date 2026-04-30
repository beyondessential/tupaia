import React, { useState } from 'react';
import { generatePath, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { useNavigate } from 'react-router';
import { Modal, ModalCenteredContent, SpinningLoader } from '@tupaia/ui-components';
import { Button, UnavailableResponseModal } from '../../components';
import { TaskDetails, TaskPageHeader, TaskActionsMenu } from '../../features';
import { useIsOfflineFirst, useSurveyResponse, useTask } from '../../api';
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

const ButtonComponent = ({ task }: { task?: SingleTaskResponse }) => {
  const from = useFromLocation();
  const isOfflineFirst = useIsOfflineFirst();
  const { data: surveyResponse } = useSurveyResponse(task?.surveyResponseId, {
    meta: { applyCustomErrorHandling: true },
  });
  const [modalOpen, setModalOpen] = useState(false);

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
    const responseUnavailable = isOfflineFirst ? !surveyResponse : !surveyResponseId;
    if (responseUnavailable)
      return (
        <>
          <StyledButton onClick={() => setModalOpen(true)} variant="outlined">
            View completed survey
          </StyledButton>
          {isOfflineFirst ? (
            <UnavailableResponseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
          ) : (
            <ErrorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
          )}
        </>
      );
    return (
      <StyledButton to={`?responseId=${surveyResponseId}`} variant="outlined">
        View completed survey
      </StyledButton>
    );
  }
  return (
    <StyledButton to={surveyLink} state={{ from }}>
      Complete
    </StyledButton>
  );
};

export const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const { data: task, isLoading } = useTask(taskId);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile && (
        <StickyMobileHeader onBack={() => navigate(ROUTES.TASKS)}>
          <Typography variant="h1">Task details</Typography>
          <Typography color="textSecondary" noWrap variant="body2">
            {task?.survey?.name}
          </Typography>
        </StickyMobileHeader>
      )}
      <TaskPageHeader title="Task details" backTo={ROUTES.TASKS}>
        <ButtonComponent task={task} />
        {task && <TaskActionsMenu task={task} />}
      </TaskPageHeader>
      <ContentWrapper>
        {isLoading && <SpinningLoader />}
        {task && <TaskDetails task={task} />}
      </ContentWrapper>
    </>
  );
};
