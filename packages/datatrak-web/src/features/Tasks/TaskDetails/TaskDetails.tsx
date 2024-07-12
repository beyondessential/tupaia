/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { LoadingContainer, TextField } from '@tupaia/ui-components';
import { useEditTask, useTask } from '../../../api';
import { Button } from '../../../components';
import { RepeatScheduleInput } from '../RepeatScheduleInput';
import { DueDatePicker } from '../DueDatePicker';
import { AssigneeInput } from '../AssigneeInput';
import { TaskForm } from '../TaskForm';
import { TaskMetadata } from './TaskMetadata';
import { TaskStatus } from '@tupaia/types';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  padding: 2.5rem;
  display: flex;
  gap: 2.5rem;
`;

const MainColumn = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SideColumn = styled.div`
  width: 25%;
  display: flex;
  flex-direction: column;
`;

const ItemWrapper = styled.div`
  &:not(:last-child) {
    margin-block-end: 1.2rem;
  }
`;

const CommentsPlaceholder = styled(ItemWrapper)`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 4px;
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

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 1rem;
  flex: 1;
`;

export const TaskDetails = () => {
  const { taskId } = useParams();
  const { data: task, isLoading } = useTask(taskId);

  const defaultValues = {
    dueDate: task?.dueDate ?? null,
    repeatSchedule: task?.repeatSchedule?.frequency ?? null,
    assigneeId: task?.assigneeId ?? null,
  };
  const formContext = useForm({
    mode: 'onChange',
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, dirtyFields },
    reset,
  } = formContext;

  const { mutate: editTask } = useEditTask(taskId);

  useEffect(() => {
    if (!task) return;
    setValue('dueDate', task?.dueDate, { shouldDirty: false, shouldValidate: true });
    setValue('repeatSchedule', task?.repeatSchedule?.frequency ?? null);
    setValue('assigneeId', task?.assigneeId ?? null);
  }, [JSON.stringify(task)]);

  const isDirty = Object.keys(dirtyFields).length > 0;

  const onClearEdit = () => {
    reset(defaultValues);
  };

  const canEditFields =
    task?.taskStatus !== TaskStatus.completed && task?.taskStatus !== TaskStatus.cancelled;

  return (
    <FormProvider {...formContext}>
      <LoadingContainer isLoading={isLoading} heading="Loading task" text="">
        <TaskForm onSubmit={handleSubmit(editTask)}>
          <Container>
            <SideColumn>
              <ItemWrapper>
                <TaskMetadata task={task} />
              </ItemWrapper>
              <ItemWrapper>
                <Controller
                  name="dueDate"
                  control={control}
                  rules={{ required: '*Required' }}
                  defaultValue={task?.dueDate}
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
                  name="repeatSchedule"
                  control={control}
                  defaultValue={task?.repeatSchedule?.frequency ?? null}
                  render={({ value, onChange }) => (
                    <RepeatScheduleInput
                      value={value}
                      onChange={onChange}
                      disabled={!canEditFields}
                    />
                  )}
                />
              </ItemWrapper>
              <ItemWrapper>
                <Controller
                  name="assigneeId"
                  control={control}
                  defaultValue={task?.assigneeId ?? null}
                  render={({ value, onChange, ref }) => (
                    <AssigneeInput
                      value={value}
                      onChange={onChange}
                      inputRef={ref}
                      countryCode={task?.entity?.countryCode}
                      surveyCode={task?.survey?.code}
                      disabled={!canEditFields}
                    />
                  )}
                />
              </ItemWrapper>
            </SideColumn>
            <MainColumn>
              <CommentsPlaceholder />
              {/** This is a placeholder for when we add in comments functionality */}
              <CommentsInput label="Add comment" />
            </MainColumn>
            <SideColumn>
              <ButtonWrapper>
                <Button variant="text" disabled={!isDirty} onClick={onClearEdit}>
                  Clear changes
                </Button>
                <Button type="submit" disabled={!isDirty || !isValid} variant="outlined">
                  Save changes
                </Button>
              </ButtonWrapper>
            </SideColumn>
          </Container>
        </TaskForm>
      </LoadingContainer>
    </FormProvider>
  );
};
