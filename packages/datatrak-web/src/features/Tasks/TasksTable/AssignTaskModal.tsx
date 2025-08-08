import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';
import { useEditTask } from '../../../api';
import { SingleTaskResponse } from '../../../types';
import { AssigneeInput } from '../AssigneeInput';
import { TaskForm } from '../TaskForm';
import { TaskSummary } from '../TaskSummary';

const Container = styled(ModalCenteredContent)`
  width: 26rem;
  max-width: 100%;
  margin: 0 auto;
  padding-block: 2.5rem;
`;

interface AssignTaskModalProps {
  task: SingleTaskResponse;
  Button: React.ComponentType<{ onClick: () => void }>;
}

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
          <TaskSummary task={task} />
          <TaskForm formContext={formContext} onSubmit={editTask}>
            <Controller
              name="assignee"
              control={control}
              rules={{ required: 'Required' }}
              defaultValue=""
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
