/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';
import { AssigneeInput } from '../AssigneeInput';
import { useEditTask } from '../../../api';
import { TaskForm } from '../TaskForm';

const Container = styled(ModalCenteredContent)`
  width: 20rem;
  max-width: 100%;
  margin: 0 auto;
`;

export const AssignTaskModal = ({ task, onClose }) => {
  const formContext = useForm({
    mode: 'onChange',
  });
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = formContext;

  const { mutate: editTask, isLoading } = useEditTask(task?.id, onClose);

  if (!task) return null;

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

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title="Assign task"
        buttons={modalButtons}
        isLoading={isLoading}
      >
        <Container>
          <FormProvider {...formContext}>
            <TaskForm onSubmit={handleSubmit(editTask)}>
              <Controller
                name="assigneeId"
                control={control}
                rules={{ required: 'Required' }}
                render={({ value, onChange, ref }, { invalid }) => (
                  <AssigneeInput
                    value={value}
                    required
                    onChange={onChange}
                    inputRef={ref}
                    countryCode={task?.entity?.countryCode}
                    surveyCode={task?.survey?.code}
                    error={invalid}
                  />
                )}
              />
            </TaskForm>
          </FormProvider>
        </Container>
      </Modal>
    </>
  );
};
