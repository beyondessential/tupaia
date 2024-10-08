/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ProjectSelectForm } from '@tupaia/ui-components';
import { useProjects, useUser } from '../api/queries';
import { useEditUser } from '../api/mutations';
import { Modal } from '../components';
import { useModal } from '../utils';
import { MODAL_ROUTES } from '../constants';

const ModalBody = styled.div`
  text-align: left;
  padding: 1.2rem;
  width: 46rem;
  max-width: 100%;
  margin-top: -1rem;

  > div {
    max-block-size: 28rem;
  }

  .MuiDialogActions-root {
    position: relative;
    top: 1rem;
  }
`;

export const ProjectSelectModal = () => {
  const { data: userData } = useUser();
  const projectId = userData?.project?.id;
  const { data: projects = [], isFetching } = useProjects();
  const { closeModal } = useModal();
  const navigate = useNavigate();

  const onSelectProject = data => {
    const { projectId } = data;
    const project = projects.find(p => p.id === projectId);
    const { code, homeEntityCode } = project;
    const dashboardGroupName = project.dashboardGroupName
      ? encodeURIComponent(project.dashboardGroupName)
      : '';
    navigate(`/${code}/${homeEntityCode}/${dashboardGroupName}`);
  };

  const { mutate: onConfirm, isLoading: isConfirming } = useEditUser(onSelectProject);

  const onRequestAccess = () => {
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
          projects={projects}
          isLoading={isFetching}
          onConfirm={onConfirm}
          isConfirming={isConfirming}
        />
      </ModalBody>
    </Modal>
  );
};
