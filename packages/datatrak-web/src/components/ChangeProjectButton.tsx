import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { useCurrentUserContext } from '../api';
import { ProjectSelectModal } from '../layout/UserMenu/ProjectSelectModal';
import { Button, TooltipButtonWrapper } from './Button';

/**
 * Manages how this “Change Project button” component is laid out. Under normal circumstances, it
 * uses block display; but if it’s the child of a paragraph or heading, it is displayed inline.
 *
 * Also adds a border to separate it from adjacent elements in certain contexts.
 */
const Container = styled.div<{ $leadingBorder?: boolean }>`
  ${props =>
    props.$leadingBorder &&
    css`
      border-inline-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.text.secondary};
      padding-inline-start: 0.5rem;
    `}

  &,
  ${TooltipButtonWrapper} {
    display: inline;
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
    inline-size: fit-content;
    line-height: inherit;
    margin: 0;
    padding: 0;
  }

  .MuiButton-label {
    display: contents;
  }
`;

interface ChangeProjectButtonProps extends React.ComponentPropsWithoutRef<typeof Container> {
  leadingBorder?: boolean;
}

export const ChangeProjectButton = ({ leadingBorder, ...props }: ChangeProjectButtonProps) => {
  const { project } = useCurrentUserContext();
  const projectName = project?.name ?? null;

  const [projectModalIsOpen, setProjectModalIsOpen] = useState(false);
  const openProjectModal = () => setProjectModalIsOpen(true);
  const closeProjectModal = () => setProjectModalIsOpen(false);

  return (
    <Container $leadingBorder={leadingBorder} {...props}>
      <ProjectButton onClick={openProjectModal} tooltip="Change project">
        {projectName ?? 'Select project'}
      </ProjectButton>
      {projectModalIsOpen && <ProjectSelectModal onBack={closeProjectModal} />}
    </Container>
  );
};
