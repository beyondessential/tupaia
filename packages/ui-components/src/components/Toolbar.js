/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import { LightTab, LightTabs } from '@tupaia/ui-components';
import { Link as RouterLink, useLocation, useRouteMatch } from 'react-router-dom';
import * as COLORS from '../theme/colors';

const toolbarHeight = '65px';

const ToolbarWrapper = styled.div`
  background-color: ${COLORS.DARK_BLUE};
  height: ${toolbarHeight};
  color: ${COLORS.WHITE};
`;

export const BaseToolbar = ({ children }) => (
  <ToolbarWrapper>
    <Container maxWidth="lg">{children}</Container>
  </ToolbarWrapper>
);

BaseToolbar.propTypes = {
  children: PropTypes.any,
};

BaseToolbar.defaultProps = {
  children: [],
};

const ToolbarTab = styled(LightTab)`
  font-size: 1.125rem;
  height: ${toolbarHeight};
  text-transform: none;
`;

/*
 * Toolbar
 * a component for navigating to router links
 */
export const TabsToolbar = ({ links }) => {
  const location = useLocation();
  const match = useRouteMatch();
  const [value, setValue] = useState(false);

  useEffect(() => {
    const valid = links.find(link => location.pathname === `${match.url}${link.to}`);
    if (valid) {
      setValue(location.pathname);
    }
  }, [location, match]);

  return (
    <BaseToolbar>
      {value && (
        <LightTabs value={value}>
          {links.map(({ label, to, icon }) => (
            <ToolbarTab
              key={to}
              to={`${match.url}${to}`}
              value={`${match.url}${to}`}
              component={RouterLink}
            >
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
};
