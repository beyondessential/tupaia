import React, { HTMLAttributes, useState } from 'react';
import styled from 'styled-components';

import { useCurrentUserContext } from '../api';
import { ProjectSelectModal } from '../layout/UserMenu/ProjectSelectModal';
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

  :is(p, h1, h2, h3, h4, h5, h6) & {
    &,
    > ${TooltipButtonWrapper} // Prevent span wrapper on button from growing to fill parent
    {
      display: inline;
    }

    :before {
      color: ${({ theme }) => theme.palette.text.primary};
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
    font-weight: 500;
    line-height: inherit;
    inline-size: fit-content;
    margin: 0;
    padding: 0;
  }

  .MuiTypography-root & .MuiButton-label {
    font-weight: 400;
  }
`;

export const ChangeProjectButton = (props: HTMLAttributes<HTMLDivElement>) => {
  const { project } = useCurrentUserContext();
  const projectName = project?.name ?? null;

  const [projectModalIsOpen, setProjectModalIsOpen] = useState(false);
  const openProjectModal = () => setProjectModalIsOpen(true);
  const closeProjectModal = () => setProjectModalIsOpen(false);

  return (
    <Container {...props}>
      <ProjectButton onClick={openProjectModal} tooltip="Change project">
        {projectName ?? 'Select project'}
      </ProjectButton>
      {projectModalIsOpen && <ProjectSelectModal onBack={closeProjectModal} />}
    </Container>
  );
};
