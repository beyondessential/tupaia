/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Paper } from '@material-ui/core';
import { ProjectSelectForm, RequestProjectAccess } from '../../features';

const Wrapper = styled(Paper)`
  padding: 1.5rem 2.5rem 1.25rem;
  max-width: none;
  width: 48rem;
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
}

export const ProjectSelectModal = ({ open, onClose, projectId }: ModalProps) => {
  const [requestAccessProjectCode, setRequestAccessProjectCode] = useState<string | null>(null);

  return (
    <Dialog open={open} onClose={onClose} PaperComponent={Wrapper} disablePortal>
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
