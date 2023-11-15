/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Paper } from '@material-ui/core';
import { ProjectSelectForm, RequestProjectAccess } from '../../features';
import { useCurrentUser } from '../../api';

const Wrapper = styled(Paper)`
  padding: 1rem 1.25rem;
  max-width: none;
  width: 48rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1.5rem 2.5rem 1.25rem;
    margin: 2rem;
  }
`;

interface ModalProps {
  onClose: () => void;
}

export const ProjectSelectModal = ({ onClose }: ModalProps) => {
  const { projectId } = useCurrentUser();
  const [requestAccessProjectCode, setRequestAccessProjectCode] = useState<string | null>(null);

  return (
    <Dialog open onClose={onClose} PaperComponent={Wrapper}>
      {requestAccessProjectCode ? (
        <RequestProjectAccess
          projectCode={requestAccessProjectCode}
          onClose={() => setRequestAccessProjectCode(null)}
        />
      ) : (
        <ProjectSelectForm
          variant="modal"
          projectId={projectId}
          onClose={onClose}
          onRequestAccess={setRequestAccessProjectCode}
        />
      )}
    </Dialog>
  );
};
