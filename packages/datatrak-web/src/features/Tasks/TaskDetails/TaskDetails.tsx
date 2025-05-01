import { Paper, Typography } from '@material-ui/core';
import { parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { CSSObject } from 'styled-components';

import { Task, TaskStatus } from '@tupaia/types';
import { LoadingContainer } from '@tupaia/ui-components';

import { useEditTask, useSurveyResponse } from '../../../api';
import {
  Button as BaseButton,
  DateTimeDisplay,
  SurveyTickIcon,
  Tile,
  TileSkeleton,
} from '../../../components';
import { SingleTaskResponse } from '../../../types';
import { AssigneeInput } from '../AssigneeInput';
import { DueDatePicker } from '../DueDatePicker';
import { RepeatScheduleInput } from '../RepeatScheduleInput';
import { TaskForm } from '../TaskForm';
import { TaskComments } from './TaskComments';
import { TaskMetadata } from './TaskMetadata';
import { TileRoot } from '../../../components/Tile';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  column-gap: 1.25rem;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  row-gap: 0;
  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    padding: 2.5rem;
  }
`;

const MainColumn = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  padding-block: 1.2rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    border-inline: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
    margin-block: 0;
    padding-block: 0;
    padding-inline: 1.25rem;
    width: 50%;
  }
`;

const SideColumn = styled.section`
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 25%;
  }
`;

/**
 * @privateRemarks Awkward type chain here is to “undo” {@link TileRoot}’s cast where it’s defined.
 */
const InitialRequestColumn = styled(SideColumn)`
  ${TileRoot as unknown as CSSObject} {
    border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
    inline-size: 100%;
  }
`;

const ItemWrapper = styled.div`
  &:not(:last-child) {
    margin-block-end: 1.2rem;
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
`;

const Wrapper = styled.div`
  .loading-screen {
    border: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const SectionHeading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 0.875rem;
  line-height: 1.3;
  font-weight: 500;
  margin-bottom: 0.25rem;
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

const generateDefaultValues = (task: SingleTaskResponse) => ({
  due_date: task.taskDueDate ?? null,
  repeat_frequency: task.repeatSchedule?.freq ?? null,
  assignee: task.assignee?.id ? task.assignee : null,
});

export const TaskDetails = ({ task }: { task: SingleTaskResponse }) => {
  const [defaultValues, setDefaultValues] = useState(generateDefaultValues(task));

  const formContext = useForm({
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

  const onSubmit = data => {
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
          <SideColumn>
            <Form formContext={formContext} onSubmit={onSubmit}>
              <ItemWrapper>
                <TaskMetadata task={task} />
              </ItemWrapper>
              <ItemWrapper>
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
              </ItemWrapper>
              <ItemWrapper>
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
              </ItemWrapper>
              <ItemWrapper>
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
              </ItemWrapper>
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
          </SideColumn>
          <MainColumn>
            <TaskComments comments={task.comments} />
          </MainColumn>
          <InitialRequestColumn>
            <SectionHeading>Initial request</SectionHeading>
            {task.initialRequestId && <InitialRequest initialRequestId={task.initialRequestId} />}
          </InitialRequestColumn>
        </Container>
      </LoadingContainer>
    </Wrapper>
  );
};
