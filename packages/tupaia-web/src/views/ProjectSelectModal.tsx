/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { ProjectSelectForm } from '@tupaia/ui-components';
import { useProjects, useUser } from '../api/queries';
import { useEditUser } from '../api/mutations';
import { Modal } from '../components';
import { useModal } from '../utils';

export const ProjectSelectModal = () => {
  const { data } = useUser();
  const projectId = data?.project?.id;
  const [requestAccessProjectCode, setRequestAccessProjectCode] = useState<string | null>(null);
  const { data: projects, isFetching } = useProjects();
  const { closeModal } = useModal();
  const { mutate: onConfirm, isLoading: isConfirming } = useEditUser(closeModal);

  console.log('requestAccessProjectCode', requestAccessProjectCode);

  return (
    <Modal isOpen={true} onClose={closeModal}>
      <ProjectSelectForm
        variant="modal"
        projectId={projectId}
        onClose={closeModal}
        onRequestAccess={setRequestAccessProjectCode}
        // @ts-ignore
        projects={projects?.projects}
        isLoading={isFetching}
        // @ts-ignore
        onConfirm={onConfirm}
        isConfirming={isConfirming}
      />
    </Modal>
  );
};
