/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { TransitionProps } from '@material-ui/core/transitions';
import { Paper, Slide } from '@material-ui/core';
import { ProjectSelectForm } from '@tupaia/ui-components';
import { RequestProjectAccess } from '../../features';
import { useCurrentUserContext, useEditUser, useProjects } from '../../api';
import { Modal } from '../../components';

const StyledModal = styled(Modal)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    .MuiPaper-root {
      height: 100%;
      background: ${({ theme }) => theme.palette.background.default};

      > div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;

        > div {
          max-height: 100%;
        }
      }
    }

    .list-wrapper {
      border: none;
    }

    h2 {
      color: ${({ theme }) => theme.palette.text.secondary};
    }

    //  Hide the close button on mobile
    .MuiButtonBase-root.MuiIconButton-root {
      display: none;
    }

    // Style select list
    .MuiList-root {
      border-radius: 10px;
      background: ${({ theme }) => theme.palette.background.paper};
      padding: 0.3rem 1rem;
      overflow: auto;

      li {
        border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

        .MuiButtonBase-root {
          font-size: 0.75rem;
          padding: 0.6rem 0;
        }
      }
    }
  }
`;

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

/**
 * Taken from [Material UI's example](https://v4.mui.com/components/dialogs/#full-screen-dialogs) to make the dialog slide up from the bottom
 */
// Todo: Make re-usable transition component
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export const ProjectSelectModal = ({ onBack }: ModalProps) => {
  const { projectId } = useCurrentUserContext();
  const [requestAccessProjectCode, setRequestAccessProjectCode] = useState<string | null>(null);
  const { data: projects, isLoading } = useProjects();
  const { mutate: onConfirm, isLoading: isConfirming } = useEditUser(onBack);

  return (
    // Enable the portal so it displays over any other content and we don't get z-index issues
    <StyledModal
      open
      onClose={onBack}
      PaperComponent={Wrapper}
      disablePortal={false}
      fullScreen
      TransitionComponent={Transition}
    >
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
    </StyledModal>
  );
};
