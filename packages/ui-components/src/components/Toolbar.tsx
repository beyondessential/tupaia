/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Container, { ContainerProps } from '@material-ui/core/Container';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LightTab, LightTabs } from './Tabs';

const toolbarHeight = '65px';

const ToolbarWrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  height: ${toolbarHeight};
  color: ${props => props.theme.palette.common.white};

  > div {
    height: 100%;
  }
`;

interface BaseToolbarProps {
  maxWidth?: ContainerProps['maxWidth'];
  children?: ReactNode;
}

export const BaseToolbar = ({ children, maxWidth = false }: BaseToolbarProps) => (
  <ToolbarWrapper>
    <Container maxWidth={maxWidth}>{children!}</Container>
  </ToolbarWrapper>
);

const ToolbarTab = styled(LightTab)`
  font-size: 1.125rem;
  height: ${toolbarHeight};
  text-transform: none;
  font-weight: 400;

  &:first-child {
    margin-left: 0;
  }
`;

/*
 * TabsToolbar
 * a component for navigating to router links
 */

interface Link {
  label: string;
  to: string;
  exact?: boolean;
  icon?: ReactNode;
  id?: string;
}

interface TabsToolbarProps {
  links: Link[];
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false | undefined;
  baseRoute: string;
}

export const TabsToolbar = ({ links: linkInput, maxWidth, baseRoute }: TabsToolbarProps) => {
  const location = useLocation();
  const links = linkInput.map(link => ({
    ...link,
    target: link.exact ? link.to : `${baseRoute}${link.to}`,
  }));
  const { target: value } = links.find(link => location.pathname === link.target) || links[0];

  return (
    <BaseToolbar maxWidth={maxWidth}>
      {value && (
        <LightTabs value={value}>
          {links.map(({ label, to, target, icon, id }) => (
            <ToolbarTab key={to} to={target} value={target} component={RouterLink} id={id ?? null}>
              {icon}
              {label}
            </ToolbarTab>
          ))}
        </LightTabs>
      )}
    </BaseToolbar>
  );
};
