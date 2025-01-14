import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProjectSelectForm } from '@tupaia/ui-components';
import { useProjects, useUser } from '../api/queries';
import { useEditUser } from '../api/mutations';
import { Modal } from '../components';
import { useModal } from '../utils';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../constants';

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

const projectSort = (a, b) => {
  // Sort by hasAccess = true first
  if (a.hasAccess !== b.hasAccess) {
    return a.hasAccess ? -1 : 1;
  }

  // Sort by hasPendingAccess = true second
  if (a.hasPendingAccess !== b.hasPendingAccess) {
    return a.hasPendingAccess ? -1 : 1;
  }

  // Otherwise, sort alphabetically by name
  return a.name.localeCompare(b.name);
};

export const ProjectSelectModal = () => {
  const { data: userData } = useUser();
  const location = useLocation();
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

  const onRequestAccess = (projectCode: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(URL_SEARCH_PARAMS.PROJECT, projectCode);
    navigate(
      {
        ...location,
        search: searchParams.toString(),
        hash: MODAL_ROUTES.REQUEST_PROJECT_ACCESS,
      },
      {
        state: {
          referrer: location,
        },
      },
    );
  };

  const sortedProjects = projects.sort(projectSort);

  return (
    <Modal isOpen={true} onClose={closeModal}>
      <ModalBody>
        <ProjectSelectForm
          variant="modal"
          projectId={projectId}
          onClose={closeModal}
          onRequestAccess={onRequestAccess}
          projects={sortedProjects}
          isLoading={isFetching}
          onConfirm={onConfirm}
          isConfirming={isConfirming}
        />
      </ModalBody>
    </Modal>
  );
};
