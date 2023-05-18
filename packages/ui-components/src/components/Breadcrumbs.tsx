/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import MuiBreadcrumbs, {
  BreadcrumbsProps as MuiBreadcrumbsProps,
} from '@material-ui/core/Breadcrumbs';
import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import {
  LinkProps as ReactRouterLinkProps,
  Link as RouterLink,
  useLocation,
} from 'react-router-dom';
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

/**
 * 
This is a workaround for a typescript error that appears because of the 'component' props on Link. It is [a known issue]{@link https://github.com/mui/material-ui/issues/16846} with MUI v4, and is supposed to be fixed in MUI v5

 */
const LinkRef = React.forwardRef<HTMLAnchorElement, ReactRouterLinkProps>((props, ref) => (
  <RouterLink innerRef={ref} {...props} />
));

const Link = (props: MuiLinkProps & ReactRouterLinkProps) => (
  <MuiLink color="inherit" {...props} component={LinkRef} />
);

/**
 * Breadcrumbs
 */

interface BreadcrumbsProps extends MuiBreadcrumbsProps {
  home?: string;
}

export const Breadcrumbs = ({ home = 'Dashboard', ...props }: BreadcrumbsProps) => {
  const location = useLocation();
  const [pathnames, setPathnames] = useState<string[]>([]);

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
