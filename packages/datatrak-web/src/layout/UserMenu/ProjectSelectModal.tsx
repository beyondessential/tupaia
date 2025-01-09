/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Paper, Typography } from '@material-ui/core';
import { IconButton, ProjectSelectForm } from '@tupaia/ui-components';
import { RequestProjectAccess } from '../../features';
import { useCurrentUserContext, useEditUser, useProjects } from '../../api';
import { Modal } from '../../components/Modal';
import { SlideTransition } from '../../components/SlideTransition';
import { ArrowLeftIcon } from '../../components';
import { useIsMobile } from '../../utils';

const StyledModal = styled(Modal)`
  //  The mobile styles are specific to the project select modal in datatrak-web so they are included here
  //  instead of in the ui-components select list component
  ${({ theme }) => theme.breakpoints.down('sm')} {
    .MuiPaper-root {
      height: 100%;
      background: ${({ theme }) => theme.palette.background.default};

      // Hide the close button on mobile
      > .MuiButtonBase-root.MuiIconButton-root {
        display: none;
      }

      > div {
        display: flex;
        flex-direction: column;
        block-size: 100%;

        > div {
          max-block-size: 100%;
        }
      }
    }

    .list-wrapper {
      border: none;
      border-radius: 0.625rem;
      padding: 0;
    }

    h2.MuiFormLabel-root {
      color: ${({ theme }) => theme.palette.text.secondary};
    }

    // Select list
    .MuiList-root {
      border-radius: 0.625rem;
      background: ${({ theme }) => theme.palette.background.paper};
      padding-inline: 1rem;
      padding-block: 0.3rem;

      > li {
        border-block-end: 1px solid ${({ theme }) => theme.palette.divider};

        .MuiButtonBase-root {
          font-size: 0.75rem;
          padding-inline: 0;
          padding-block: 0.75rem;

          &.Mui-selected {
            border: none;
          }
        }
      }
    }

    // Modal Actions
    .MuiDialogActions-root {
      .MuiButton-root:first-child {
        display: none;
      }
      .MuiButton-root {
        flex: 1;
        margin: 0;
      }
    }
  }
`;

const PaperComponent = styled(Paper)`
  padding: 1rem 1.25rem;
  max-width: none;
  width: 48rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2.5rem 1.25rem;
    margin: 2rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-top: -1rem;
  }
`;

const BackButton = styled(IconButton)`
  margin-inline-start: -1rem;
  color: ${({ theme }) => theme.palette.text.primary};

  svg {
    font-size: 1.2rem;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    display: none;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1.25rem;
`;

interface ModalProps {
  onBack: () => void;
}

export const ProjectSelectModal = ({ onBack }: ModalProps) => {
  const { projectId } = useCurrentUserContext();
  const [requestAccessProjectCode, setRequestAccessProjectCode] = useState<string | null>(null);
  const { data: projects, isLoading } = useProjects();
  const { mutate: onConfirm, isLoading: isConfirming } = useEditUser(onBack);
  const isMobile = useIsMobile();

  return (
    // Enable the portal so it displays over any other content and we don't get z-index issues
    <StyledModal
      open
      onClose={onBack}
      PaperComponent={PaperComponent}
      disablePortal={false}
      fullScreen={isMobile}
      TransitionComponent={isMobile ? SlideTransition : undefined}
    >
      {requestAccessProjectCode ? (
        <RequestProjectAccess
          projectCode={requestAccessProjectCode}
          onBack={() => setRequestAccessProjectCode(null)}
        />
      ) : (
        <>
          <Header>
            <BackButton onClick={onBack}>
              <ArrowLeftIcon />
            </BackButton>
            <Title>Select project</Title>
          </Header>
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
        </>
      )}
    </StyledModal>
  );
};
