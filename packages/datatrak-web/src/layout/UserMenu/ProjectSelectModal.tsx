import { Paper, Typography } from '@material-ui/core';
import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { IconButton, ListItemRoot, ProjectSelectForm, VisuallyHidden } from '@tupaia/ui-components';

import { useCurrentUserContext, useEditUser, useProjects } from '../../api';
import { Modal } from '../../components/Modal';
import { SlideTransition } from '../../components/SlideTransition';
import { RequestProjectAccess } from '../../features';
import { useIsMobile } from '../../utils';

const StyledModal = styled(Modal)<{ $requestAccess?: boolean }>`
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
        block-size: ${props => (props.$requestAccess ? 'auto' : '100%')};

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
        padding: 0;
        border-block-end: 1px solid ${({ theme }) => theme.palette.divider};

        > div {
          font-size: 0.75rem;
          padding-inline: 0;
          padding-block: 0.75rem;
        }
      }
    }

    ${props =>
      props.fullScreen &&
      css`
        ${ListItemRoot} {
          border-radius: 0;
          min-block-size: 2.75rem;
          padding-block: 0;
        }
        // Use only checkmark as selection indicator
        ${ListItemRoot}.Mui-selected {
          border-block-start: 0;
          border-inline: 0;
        }
      `}

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
  padding-block: 1rem;
  padding-inline: 1.25rem;
  max-width: none;
  width: 48rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin: 2rem;
    padding-block: 1rem 1.25rem;
    padding-inline: 2.5rem;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    *:has(> &) {
      padding-block-start: 0;
    }
  }
`;

const BackButton = styled(IconButton)`
  margin-inline-start: -1rem;
  color: ${({ theme }) => theme.palette.text.primary};

  svg {
    font-size: 1.2rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
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
      $requestAccess={!!requestAccessProjectCode}
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
              <ChevronLeft />
              <VisuallyHidden>Back</VisuallyHidden>
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
