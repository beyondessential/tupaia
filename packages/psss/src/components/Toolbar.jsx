/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
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

export const BaseToolbar = ({ children, maxWidth = false }) => (
  <ToolbarWrapper>
    <Container maxWidth={maxWidth}>{children}</Container>
  </ToolbarWrapper>
);

BaseToolbar.propTypes = {
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  children: PropTypes.node,
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

export const TabsToolbar = ({ links: linkInput, maxWidth, baseRoute }) => {
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

TabsToolbar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      exact: PropTypes.bool,
      icon: PropTypes.node,
      id: PropTypes.string,
    }),
  ).isRequired,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  baseRoute: PropTypes.string.isRequired,
};
