import React, { useState } from 'react';
import styled from 'styled-components';
import { ProjectSelectModal } from '../layout/UserMenu/ProjectSelectModal';
import { useCurrentUserContext } from '../api';
import { UserDetails as NavbarUserDetails } from '../layout/UserMenu/UserInfo';
import { Button, TooltipButtonWrapper } from './Button';

/**
 * Manages how this “Change Project button” component is laid out. Under normal circumstances, it
 * uses block display; but if it’s the child of a paragraph or heading, it is displayed inline.
 *
 * Also adds a border to separate it from adjacent elements in certain contexts.
 */
const Container = styled.div`
  ${NavbarUserDetails} & {
    border-inline-start: 1px solid ${({ theme }) => theme.palette.text.secondary};
    padding-inline-start: 0.5rem;
  }

  .MuiTypography-root & {
    &,
    > ${TooltipButtonWrapper} // Prevent span wrapper on button from growing to fill parent
    {
      display: inline;
    }

    :before {
      color: ${({ theme }) => theme.palette.text.secondary};
      content: '|';
      margin-inline: 0.25rem;
    }
  }
`;

const ProjectButton = styled(Button).attrs({
  disableFocusRipple: true,
  disableRipple: true,
  variant: 'text',
})`
  color: ${({ theme }) => theme.palette.text.secondary};

  :focus,
  :focus-visible,
  :hover {
    background: none;
    color: ${({ theme }) => theme.palette.action.hover};
    text-decoration: underline;
  }

  &,
  .MuiButton-root,
  .MuiButton-label {
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    inline-size: fit-content;
    margin: 0;
    padding: 0;
  }
`;

export const ChangeProjectButton = ({ className }: { className?: string }) => {
  const { project } = useCurrentUserContext();
  const projectName = project?.name ?? null;

  const [projectModalIsOpen, setProjectModalIsOpen] = useState(false);
  const openProjectModal = () => setProjectModalIsOpen(true);
  const closeProjectModal = () => setProjectModalIsOpen(false);

  return (
    <Container className={className}>
      <ProjectButton onClick={openProjectModal} tooltip="Change project">
        {projectName ?? 'Select project'}
      </ProjectButton>
      {projectModalIsOpen && <ProjectSelectModal onBack={closeProjectModal} />}
    </Container>
  );
};
