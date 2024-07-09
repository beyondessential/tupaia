/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { UserAccount } from '@tupaia/types';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';
import { AssigneeInput } from '../AssigneeInput';

const Container = styled(ModalCenteredContent)`
  width: 20rem;
  max-width: 100%;
  margin: 0 auto;
`;

export const AssignTaskModal = ({ task, onClose }) => {
  const [assigneeId, setAssigneeId] = useState<UserAccount['id'] | null>(null);

  const onCloseModal = () => {
    setAssigneeId(null);
    onClose();
  };

  const onSubmit = e => {
    e.preventDefault();
    console.log('Assign task', assigneeId);
    // onCloseModal();
  };

  const modalButtons = [
    {
      text: 'Cancel',
      onClick: onCloseModal,
      variant: 'outlined',
      id: 'cancel',
    },
    {
      text: 'Save',
      onClick: onSubmit,
      id: 'save',
      type: 'submit',
      disabled: !assigneeId,
    },
  ];

  return (
    <>
      <Modal isOpen={!!task} onClose={onCloseModal} title="Assign task" buttons={modalButtons}>
        <Container>
          <form onSubmit={onSubmit}>
            <AssigneeInput
              value={assigneeId}
              onChange={setAssigneeId}
              countryCode={task?.entity?.countryCode}
              surveyCode={task?.survey?.code}
            />
          </form>
        </Container>
      </Modal>
    </>
  );
};
