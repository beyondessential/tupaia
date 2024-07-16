/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';
import { useEditTask } from '../../../api';
import { Task } from '../../../types';
import { AssigneeInput } from '../AssigneeInput';
import { TaskForm } from '../TaskForm';
import { StatusPill } from '../StatusPill';
import { displayDate } from '../../../utils';
import { getRepeatScheduleOptions } from '../RepeatScheduleInput';

const Container = styled(ModalCenteredContent)`
  width: 26rem;
  max-width: 100%;
  margin: 0 auto;
  padding-block: 2.5rem;
`;

const MetaDataContainer = styled.div`
  padding-inline: 1rem;
  padding-block-start: 1.1rem;
  padding-block-end: 1.5rem;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 4px;
  margin-block-end: 1.2rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: normal;
  margin-block-end: 0.2rem;
`;

const Value = styled(Typography)`
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const ItemWrapper = styled.div`
  &:not(:last-child) {
    margin-block-end: 1.2rem;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  &:first-child {
    width: 58%;
    padding-inline-end: 1rem;
  }
  &:last-child {
    width: 42%;
    border-left: 1px solid ${({ theme }) => theme.palette.divider};
    padding-inline-start: 1rem;
  }
  ${ItemWrapper} {
    height: 2.5rem;
  }
`;

const Row = styled.div`
  display: flex;
  margin-block-end: 1.2rem;
`;

interface AssignTaskModalProps {
  task: Task;
  Button: React.ComponentType<{ onClick: () => void }>;
}

const useDisplayRepeatSchedule = (task: Task) => {
  // TODO: When repeating tasks are implemented, make sure the repeat schedule is displayed correctly once a due date is returned with the task
  const repeatScheduleOptions = getRepeatScheduleOptions(task.dueDate);
  const { label } = repeatScheduleOptions[0];
  if (!task.repeatSchedule?.frequency) {
    return label;
  }
  const { frequency } = task.repeatSchedule;
  const selectedOption = repeatScheduleOptions.find(option => option.value === frequency);
  if (selectedOption) return selectedOption.label;
  return label;
};

export const AssignTaskModal = ({ task, Button }: AssignTaskModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const formContext = useForm({
    mode: 'onChange',
  });
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = formContext;
  const onClose = () => setIsOpen(false);
  const { mutate: editTask, isLoading } = useEditTask(task.id, onClose);

  const modalButtons = [
    {
      text: 'Cancel',
      onClick: onClose,
      variant: 'outlined',
      id: 'cancel',
      disabled: isLoading,
    },
    {
      text: 'Save',
      onClick: handleSubmit(editTask),
      id: 'save',
      type: 'submit',
      disabled: isLoading || !isValid,
    },
  ];

  const displayRepeatSchedule = useDisplayRepeatSchedule(task);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Assign task"
        buttons={modalButtons}
        isLoading={isLoading}
      >
        <Container>
          <MetaDataContainer>
            <Row>
              <Column>
                <ItemWrapper>
                  <Title>Survey</Title>
                  <Value>{task.survey.name}</Value>
                </ItemWrapper>
                <ItemWrapper>
                  <Title>Repeating task</Title>
                  <Value>{displayRepeatSchedule}</Value>
                </ItemWrapper>
              </Column>
              <Column>
                <ItemWrapper>
                  <Title>Entity</Title>
                  <Value>{task.entity.name}</Value>
                </ItemWrapper>
                <ItemWrapper>
                  <Title>Due date</Title>
                  <Value>{displayDate(task.dueDate)}</Value>
                </ItemWrapper>
              </Column>
            </Row>
            <ItemWrapper>
              <Title>Status</Title>
              <StatusPill status={task.taskStatus} />
            </ItemWrapper>
          </MetaDataContainer>
          <TaskForm onSubmit={handleSubmit(editTask)}>
            <Controller
              name="assignee_id"
              control={control}
              rules={{ required: 'Required' }}
              render={({ value, onChange, ref }, { invalid }) => (
                <AssigneeInput
                  value={value}
                  onChange={onChange}
                  inputRef={ref}
                  countryCode={task.entity.countryCode}
                  surveyCode={task.survey.code}
                  error={invalid}
                />
              )}
            />
          </TaskForm>
        </Container>
      </Modal>
    </>
  );
};
