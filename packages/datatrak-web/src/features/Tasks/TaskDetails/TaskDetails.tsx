import { Paper, Typography } from '@material-ui/core';
import { parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Frequency } from 'rrule';
import styled from 'styled-components';

import { DatatrakWebTasksRequest, Task, TaskStatus } from '@tupaia/types';
import { LoadingContainer, LoadingScreen, VisuallyHidden } from '@tupaia/ui-components';

import { useEditTask, useSurveyResponse } from '../../../api';
import {
  Button as BaseButton,
  DateTimeDisplay,
  SurveyTickIcon,
  Tile,
  TileSkeleton,
} from '../../../components';
import { TileRoot } from '../../../components/Tile';
import { SingleTaskResponse } from '../../../types';
import { AssigneeInput } from '../AssigneeInput';
import { DueDatePicker } from '../DueDatePicker';
import { RepeatScheduleInput } from '../RepeatScheduleInput';
import { TaskForm } from '../TaskForm';
import { TaskComments } from './TaskComments';
import { TaskMetadata } from './TaskMetadata';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  display: grid;
  gap: 1.25rem;
  grid-template-areas: '--initial-request' '--edit' '--comment';
  padding-block: 1.2rem;
  padding: 1rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    grid-template-areas: '--edit --comment --initial-request';
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
    grid-template-rows: 1fr;
    padding: 2.5rem;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;

  ${props => props.theme.breakpoints.down('sm')} {
    border-block-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
    padding-block-start: 1.25rem;
  }
`;

const CommentSection = styled(Section)`
  ${({ theme }) => theme.breakpoints.up('md')} {
    border-inline: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
    margin-block: 0;
    padding-block: 0;
    padding-inline: 1.25rem;
  }
`;

const InitialRequestSection = styled(Section)`
  ${TileRoot} {
    border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
    inline-size: 100%;
  }

  ${props => props.theme.breakpoints.down('sm')} {
    border-block-start: unset;
    padding-block-start: unset;
  }
`;

const Button = styled(BaseButton).attrs({
  variant: 'outlined',
})`
  &:disabled {
    color: ${({ theme }) => theme.palette.primary.main};
    border-color: ${({ theme }) => theme.palette.primary.main};
    opacity: 0.3;
  }
`;

const ClearButton = styled(Button).attrs({
  variant: 'text',
})`
  padding-inline: 0.5rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex: 1;
`;

const Form = styled(TaskForm)`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Wrapper = styled.div`
  ${LoadingScreen} {
    border: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const SectionHeading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-weight: 500;
  margin-block-end: 0.5rem;
`;

const InitialRequest = ({ initialRequestId }: { initialRequestId: Task['initial_request_id'] }) => {
  const { data: surveyResponse, isFetching } = useSurveyResponse(initialRequestId, {
    meta: { applyCustomErrorHandling: true },
  });

  if (isFetching) return <TileSkeleton aria-busy />;

  if (!surveyResponse) return null;

  const { id, countryName, dataTime, surveyName, entityName } = surveyResponse;
  return (
    <Tile
      heading={surveyName}
      replace
      to={`?responseId=${id}`}
      tooltip={
        <>
          {surveyName}
          <br />
          {entityName}
        </>
      }
      leadingIcons={<SurveyTickIcon />}
    >
      <p>{entityName}</p>
      <p>
        {countryName}, <DateTimeDisplay date={parseISO(dataTime)} variant="date" />
      </p>
    </Tile>
  );
};

const InitialRequestEmptyState = styled(Typography).attrs({ children: 'None' })`
  color: ${props => props.theme.palette.text.secondary};
  font-style: italic;
`;

interface UpdateTaskFormFields {
  /** ISO 8601 format */
  due_date: string;
  repeat_frequency: Frequency;
  assignee: DatatrakWebTasksRequest.TaskAssignee;
}

const generateDefaultValues = (task: SingleTaskResponse) => ({
  due_date: task.taskDueDate ?? null,
  repeat_frequency: task.repeatSchedule?.freq ?? null,
  assignee: task.assignee?.id ? task.assignee : null,
});

export const TaskDetails = ({ task }: { task: SingleTaskResponse }) => {
  const [defaultValues, setDefaultValues] = useState(generateDefaultValues(task));

  const formContext = useForm<UpdateTaskFormFields>({
    mode: 'onChange',
    defaultValues,
  });
  const {
    control,
    watch,
    formState: { dirtyFields },
    reset,
  } = formContext;

  const { mutate: editTask, isLoading: isSaving } = useEditTask(task.id);

  const isDirty = Object.keys(dirtyFields).length > 0;

  const onClearEdit = () => {
    reset();
  };

  // Reset form when task changes, i.e after task is saved and the task is re-fetched
  useEffect(() => {
    const newDefaultValues = generateDefaultValues(task);

    setDefaultValues(newDefaultValues);

    reset(newDefaultValues);
  }, [JSON.stringify(task)]);

  const canEditFields =
    task.taskStatus !== TaskStatus.completed && task.taskStatus !== TaskStatus.cancelled;

  const dueDate = watch('due_date');

  const onSubmit = (data: UpdateTaskFormFields) => {
    const updatedFields = Object.keys(dirtyFields).reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

    editTask(updatedFields);
  };

  return (
    <Wrapper>
      <LoadingContainer isLoading={isSaving} heading="Saving task" text="">
        <Container>
          <Section style={{ gridArea: '--edit' }}>
            <VisuallyHidden as="h2">Key details</VisuallyHidden>
            <Form formContext={formContext} onSubmit={onSubmit}>
              <TaskMetadata task={task} />
              <Controller
                name="due_date"
                control={control}
                render={({ value, onChange, ref }, { invalid }) => (
                  <DueDatePicker
                    value={value}
                    onChange={onChange}
                    inputRef={ref}
                    label="Due date"
                    disablePast
                    fullWidth
                    required
                    invalid={invalid}
                    disabled={!canEditFields}
                  />
                )}
              />
              <Controller
                name="repeat_frequency"
                control={control}
                render={({ value, onChange }) => (
                  <RepeatScheduleInput
                    value={value}
                    onChange={onChange}
                    disabled={!canEditFields}
                    dueDate={dueDate}
                  />
                )}
              />
              <Controller
                name="assignee"
                control={control}
                render={({ value, onChange, ref }) => (
                  <AssigneeInput
                    value={value}
                    onChange={onChange}
                    inputRef={ref}
                    countryCode={task.entity.countryCode}
                    surveyCode={task.survey.code}
                    disabled={!canEditFields}
                  />
                )}
              />
              {canEditFields && (
                <ButtonWrapper>
                  <ClearButton disabled={!isDirty} onClick={onClearEdit}>
                    Clear changes
                  </ClearButton>
                  <Button type="submit" disabled={!isDirty} variant="outlined">
                    Save changes
                  </Button>
                </ButtonWrapper>
              )}
            </Form>
          </Section>
          <CommentSection style={{ gridArea: '--comment' }}>
            <VisuallyHidden as="h2">Comments</VisuallyHidden>
            <TaskComments comments={task.comments} />
          </CommentSection>
          <InitialRequestSection style={{ gridArea: '--initial-request' }}>
            <SectionHeading>Initial request</SectionHeading>
            {task.initialRequestId ? (
              <InitialRequest initialRequestId={task.initialRequestId} />
            ) : (
              <InitialRequestEmptyState />
            )}
          </InitialRequestSection>
        </Container>
      </LoadingContainer>
    </Wrapper>
  );
};
