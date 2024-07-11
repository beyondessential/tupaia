/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { useTask } from '../../../api';
import { RepeatScheduleInput } from '../RepeatScheduleInput';
import { DueDatePicker } from '../DueDatePicker';
import { TaskForm } from '../TaskForm';
import { TaskMetadata } from './TaskMetadata';
import { AssigneeInput } from '../AssigneeInput';
import { TextField } from '@tupaia/ui-components';

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

export const TaskDetails = () => {
  const { taskId } = useParams();
  const { data: task } = useTask(taskId);
  const formContext = useForm({
    mode: 'onChange',
    defaultValues: {
      dueDate: task?.dueDate ?? null,
      repeatSchedule: task?.repeatSchedule?.frequency ?? null,
      assigneeId: task?.assigneeId ?? null,
    },
  });
  const { control, handleSubmit, setValue } = formContext;

  useEffect(() => {
    if (!task) return;
    setValue('dueDate', task?.dueDate);
    setValue('repeatSchedule', task?.repeatSchedule?.frequency ?? null);
    setValue('assigneeId', task?.assigneeId ?? null);
  }, [JSON.stringify(task)]);

  const onSubmit = data => {
    console.log(data);
  };

  return (
    <FormProvider {...formContext}>
      <TaskForm onSubmit={handleSubmit(onSubmit)}>
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
                    resetOnDueDateChange={false}
                  />
                )}
              />
            </ItemWrapper>
            <ItemWrapper>
              <Controller
                name="assigneeId"
                control={control}
                render={({ value, onChange, ref }) => (
                  <AssigneeInput
                    value={value}
                    onChange={onChange}
                    inputRef={ref}
                    countryCode={task?.entity?.countryCode}
                    surveyCode={task?.survey?.code}
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
          <SideColumn />
        </Container>
      </TaskForm>
    </FormProvider>
  );
};
