/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import * as COLORS from '../theme/colors';
import { Home } from '../components/Icons';
import { Route, Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  text-transform: capitalize;

  .MuiLink-root {
    display: flex;
    align-items: center;

    svg {
      font-size: 1rem;
      margin-right: 0.5rem;
    }
  }

  .MuiBreadcrumbs-separator {
    margin-left: 0;
    margin-right: 0;

    svg {
      font-size: 1rem;
    }
  }
`;

const Link = props => <MuiLink color="inherit" {...props} component={RouterLink} />;

/**
 * Breadcrumbs
 */
export const Breadcrumbs = ({ home = 'Dashboard', ...props }) => (
  <Route>
    {({ location }) => {
      const pathnames = location.pathname.split('/').filter(x => x);
      return (
        <StyledBreadcrumbs separator={<NavigateNextIcon />} {...props}>
          <Link color="inherit" to="/">
            <Home /> {home}
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `${pathnames.slice(0, index + 1).join('/')}`;

            return last ? (
              <span key={to}>{value}</span>
            ) : (
              <Link color="inherit" to={to} key={to}>
                {value}
              </Link>
            );
          })}
        </StyledBreadcrumbs>
      );
    }}
  </Route>
);

/*
 * Light Breadcrumbs
 */
export const LightBreadcrumbs = styled(Breadcrumbs)`
  color: ${COLORS.LIGHT_BLUE};

  svg {
    color: ${COLORS.WHITE};
  }

  a {
    color: ${COLORS.WHITE};
  }
`;
