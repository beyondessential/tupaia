import { Paper, Typography } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { LoadingContainer } from '@tupaia/ui-components';
import { parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { useEditTask, useSurveyResponse } from '../../../api';
import { Button as BaseButton, SurveyTickIcon, Tile } from '../../../components';
import { DateTimeDisplay } from '../../../components/DateTimeDisplay';
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: min(2.5rem, 2%);
  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    padding: 2.5rem;
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  margin-block: 1.2rem;
  border-color: ${({ theme }) => theme.palette.divider};
  border-style: solid;
  border-width: 1px 0;
  padding-block: 1.2rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 50%;
    margin-block: 0;
    padding-inline: 1.2rem;
    padding-block: 0;
    border-width: 0 1px;
  }
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 25%;
  }

  a.MuiButton-root {
    border: 1px solid ${({ theme }) => theme.palette.divider};
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

const InitialRequest = ({ initialRequestId }) => {
  const { data: surveyResponse, isLoading } = useSurveyResponse(initialRequestId, {
    meta: { applyCustomErrorHandling: true },
  });
  if (isLoading || !surveyResponse) {
    return null;
  }
  const { id, countryName, dataTime, surveyName, entityName } = surveyResponse;
  return (
    <Tile
      title={surveyName}
      text={entityName}
      to={`?responseId=${id}`}
      tooltip={
        <>
          {surveyName}
          <br />
          {entityName}
        </>
      }
      Icon={SurveyTickIcon}
    >
      {countryName}, <DateTimeDisplay date={parseISO(dataTime)} variant="date" />
    </Tile>
  );
};

export const TaskDetails = ({ task }: { task: SingleTaskResponse }) => {
  const generateDefaultValues = (task: SingleTaskResponse) => {
    return {
      due_date: task.taskDueDate ?? null,
      repeat_frequency: task.repeatSchedule?.freq ?? null,
      assignee: task.assignee?.id ? task.assignee : null,
    };
  };
  const [defaultValues, setDefaultValues] = useState(generateDefaultValues(task));

  const formContext = useForm({
    mode: 'onChange',
    defaultValues,
  });
  const {
    control,
    handleSubmit,
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
            <Form onSubmit={handleSubmit(onSubmit)}>
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
          <SideColumn>
            <SectionHeading>Initial request </SectionHeading>
            {task.initialRequestId && <InitialRequest initialRequestId={task.initialRequestId} />}
          </SideColumn>
        </Container>
      </LoadingContainer>
    </Wrapper>
  );
};
