/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { LoadingContainer, TextField } from '@tupaia/ui-components';
import { useEditTask } from '../../../api';
import { Button } from '../../../components';
import { useFromLocation } from '../../../utils';
import { SingleTaskResponse } from '../../../types';
import { RepeatScheduleInput } from '../RepeatScheduleInput';
import { DueDatePicker } from '../DueDatePicker';
import { AssigneeInput } from '../AssigneeInput';
import { TaskForm } from '../TaskForm';
import { ROUTES } from '../../../constants';
import { TaskMetadata } from './TaskMetadata';
import { TaskComments } from './TaskComments';

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
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 44%;
    margin-block: 0;
  }
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 28%;
  }
`;

const ItemWrapper = styled.div`
  &:not(:last-child) {
    margin-block-end: 1.2rem;
  }
`;

const CommentsInput = styled(TextField).attrs({
  multiline: true,
  variant: 'outlined',
  fullWidth: true,
  rows: 4,
})`
  margin-block-end: 0;
  .MuiOutlinedInput-inputMultiline {
    padding-inline: 1rem;
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
  .loading-screen {
    border: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

export const TaskDetails = ({ task }: { task: SingleTaskResponse }) => {
  const navigate = useNavigate();
  const backLink = useFromLocation();

  const defaultValues = {
    due_date: task.dueDate ?? null,
    repeat_schedule: task.repeatSchedule?.frequency ?? null,
    assignee_id: task.assigneeId ?? null,
  };
  const formContext = useForm({
    mode: 'onChange',
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { isValid, dirtyFields },
    reset,
  } = formContext;

  const navigateBack = () => {
    navigate(backLink || ROUTES.TASKS);
  };

  const { mutate: editTask, isLoading: isSaving } = useEditTask(task.id, navigateBack);

  const isDirty = Object.keys(dirtyFields).length > 0;

  const onClearEdit = () => {
    reset();
  };

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
    <Form onSubmit={handleSubmit(onSubmit)}>
      <LoadingContainer isLoading={isSaving} heading="Saving task" text="">
        <Container>
          <SideColumn>
            <ItemWrapper>
              <TaskMetadata task={task} />
            </ItemWrapper>
            <ItemWrapper>
              <Controller
                name="due_date"
                control={control}
                rules={{ required: '*Required' }}
                defaultValue={defaultValues.due_date}
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
                name="repeat_schedule"
                control={control}
                defaultValue={defaultValues.repeat_schedule}
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
                name="assignee_id"
                control={control}
                defaultValue={defaultValues.assignee_id}
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
          </SideColumn>
          <MainColumn>
            <TaskComments comments={task.comments} />
            <CommentsInput label="Add comment" name="comment" inputRef={register} />
          </MainColumn>
          <SideColumn>
            <ButtonWrapper>
              <ClearButton disabled={!isDirty} onClick={onClearEdit}>
                Clear changes
              </ClearButton>
              <Button type="submit" disabled={!isDirty || !isValid} variant="outlined">
                Save changes
              </Button>
            </ButtonWrapper>
          </SideColumn>
        </Container>
      </LoadingContainer>
    </Form>
  );
};
