import React, { useState } from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { ProjectSelectForm } from '@tupaia/ui-components';
import { RequestProjectAccess } from '../../features';
import { useCurrentUserContext, useEditUser, useProjects } from '../../api';
import { Modal } from '../../components';

const Wrapper = styled(Paper)`
  padding: 1rem 1.25rem;
  max-width: none;
  width: 48rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2.5rem 1.25rem;
    margin: 2rem;
  }
`;

interface ModalProps {
  onBack: () => void;
}

export const ProjectSelectModal = ({ onBack }: ModalProps) => {
  const { projectId } = useCurrentUserContext();
  const [requestAccessProjectCode, setRequestAccessProjectCode] = useState<string | null>(null);
  const { data: projects, isLoading } = useProjects();
  const { mutate: onConfirm, isLoading: isConfirming } = useEditUser(onBack);

  return (
    // Enable the portal so it displays over any other content and we don't get z-index issues
    <Modal open onClose={onBack} PaperComponent={Wrapper} disablePortal={false}>
      {requestAccessProjectCode ? (
        <RequestProjectAccess
          projectCode={requestAccessProjectCode}
          onBack={() => setRequestAccessProjectCode(null)}
        />
      ) : (
        <ProjectSelectForm
          variant="modal"
          projectId={projectId}
          onClose={onBack}
          onRequestAccess={setRequestAccessProjectCode}
          projects={projects}
          isLoading={isLoading}
          onConfirm={onConfirm}
          isConfirming={isConfirming}
        />
      )}
    </Modal>
  );
};
