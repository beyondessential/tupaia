import { Button, useMediaQuery, useTheme } from '@material-ui/core';
import React, { useState, HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';

import { ArrowLeftIcon } from '../../../components';

const AdaptiveSubgrid = styled.div`
  ${props => props.theme.breakpoints.up('sm')} {
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    grid-template-areas: inherit;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
  }
`;

const ExpandButton = styled(Button).attrs({
  fullWidth: true,
})`
  grid-area: --collapse-control;
  margin-block-end: 0.5rem;

  .MuiButton-label {
    display: flex;
    justify-content: space-between;
  }
`;

const ExpandIcon = styled(ArrowLeftIcon)`
  font-size: 1rem;
  transition: transform 350ms var(--ease-in-out-quad);

  transform: rotate(-90deg);
  ${ExpandButton}[aria-expanded="true"] & {
    transform: rotate(-270deg);
  }
`;

const Content = styled.div`
  display: contents;
  ${props => props.theme.breakpoints.down('xs')} {
    display: block;
    transition: 350ms var(--ease-in-out-quad);
    transition-property: block-size, display, opacity;
    transition-behavior: allow-discrete;

    // For exit transition
    &[hidden] {
      block-size: 0;
      opacity: 0;
    }

    // For entry transition
    &:not([hidden]) {
      @starting-style {
        block-size: 0;
        opacity: 0;
      }
    }
  }
`;

interface AdaptiveCollapseProps extends HTMLAttributes<HTMLDivElement> {
  contentProps?: HTMLAttributes<HTMLDivElement>;
  defaultOpen?: boolean;
  label: ReactNode;
  name: string;
}

export const AdaptiveCollapse = ({
  children,
  contentProps,
  defaultOpen = false,
  label,
  name,
  ...props
}: AdaptiveCollapseProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const isCollapsible = useMediaQuery(useTheme().breakpoints.down('xs'));

  return (
    <AdaptiveSubgrid {...props}>
      {isCollapsible ? (
        <ExpandButton
          aria-controls={name}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
          endIcon={<ExpandIcon />}
        >
          {label}
        </ExpandButton>
      ) : (
        label
      )}
      <Content hidden={isCollapsible && !isExpanded} id={name}>
        {children}
      </Content>
    </AdaptiveSubgrid>
  );
};
