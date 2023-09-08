/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Dialog, Paper } from '@material-ui/core';
import { ProjectSelectForm } from '../../features';

const Wrapper = styled(Paper)`
  padding: 24px 40px 20px;
  max-width: none;
  width: 48rem;
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
}

export const ProjectSelectModal = ({ open, onClose, projectId }: ModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} PaperComponent={Wrapper} disablePortal>
      <ProjectSelectForm variant="modal" projectId={projectId} onSuccess={onClose} />
    </Dialog>
  );
};
