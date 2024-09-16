/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { ProjectSelectForm } from '@tupaia/ui-components';
import { useProjects, useUser } from '../api/queries';
import { useEditUser } from '../api/mutations';
import { Modal } from '../components';
import { useModal } from '../utils';
import { MODAL_ROUTES } from '../constants';
import { useNavigate } from 'react-router-dom';

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.2rem;
  width: 48rem;
  max-width: 100%;
`;

export const ProjectSelectModal = () => {
  const { data } = useUser();
  const projectId = data?.project?.id;
  const [requestAccessProjectCode, setRequestAccessProjectCode] = useState<string | null>(null);
  const { data: projects, isFetching } = useProjects();
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const { mutate: onConfirm, isLoading: isConfirming } = useEditUser(closeModal);

  console.log('requestAccessProjectCode', requestAccessProjectCode);

  const onRequestAccess = (projectCode: string) => {
    setRequestAccessProjectCode(projectCode);
    navigate({
      ...location,
      hash: MODAL_ROUTES.REQUEST_PROJECT_ACCESS,
    });
  };

  return (
    <Modal isOpen={true} onClose={closeModal}>
      <ModalBody>
        <ProjectSelectForm
          variant="modal"
          projectId={projectId}
          onClose={closeModal}
          onRequestAccess={onRequestAccess}
          // @ts-ignore
          projects={projects?.projects}
          isLoading={isFetching}
          // @ts-ignore
          onConfirm={onConfirm}
          isConfirming={isConfirming}
        />
      </ModalBody>
    </Modal>
  );
};
