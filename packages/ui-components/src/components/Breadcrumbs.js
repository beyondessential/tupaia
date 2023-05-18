/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Home as HomeIcon } from './Icons';

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
export const Breadcrumbs = ({ home, ...props }) => {
  const location = useLocation();
  const [pathnames, setPathnames] = useState([]);

  useEffect(() => {
    const newPathnames = location.pathname.split('/').filter(x => x);
    setPathnames(newPathnames);
  }, [location]);

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />} {...props}>
      <Link to="/">
        <HomeIcon /> {home}
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `${pathnames.slice(0, index + 1).join('/')}`;

        return last ? (
          <span key={to}>{value}</span>
        ) : (
          <Link to={to} key={to}>
            {value}
          </Link>
        );
      })}
    </StyledBreadcrumbs>
  );
};

Breadcrumbs.propTypes = {
  home: PropTypes.string,
};

Breadcrumbs.defaultProps = {
  home: 'Dashboard',
};

/*
 * Light Breadcrumbs
 */
export const LightBreadcrumbs = styled(Breadcrumbs)`
  color: ${props => props.theme.palette.secondary.light};

  svg {
    color: ${props => props.theme.palette.common.white};
  }

  a {
    color: ${props => props.theme.palette.common.white};
  }
`;
