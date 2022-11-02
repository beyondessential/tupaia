/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation, useRouteMatch } from 'react-router-dom';
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

export const BaseToolbar = ({ children, maxWidth }) => (
  <ToolbarWrapper>
    <Container maxWidth={maxWidth}>{children}</Container>
  </ToolbarWrapper>
);

BaseToolbar.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
};

BaseToolbar.defaultProps = {
  maxWidth: null,
};

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
export const TabsToolbar = ({ links: linkInput, maxWidth }) => {
  const location = useLocation();
  const match = useRouteMatch();
  const links = linkInput.map(link => ({
    ...link,
    target: link.exact ? link.to : `${match.url}${link.to}`,
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

TabsToolbar.propTypes = {
  links: PropTypes.array.isRequired,
  maxWidth: PropTypes.string,
};

TabsToolbar.defaultProps = {
  maxWidth: null,
};
