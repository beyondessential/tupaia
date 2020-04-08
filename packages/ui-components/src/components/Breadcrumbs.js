/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../theme/colors';
import { Home } from '../components/Icons';
import styled from 'styled-components';

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  
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

export const Breadcrumbs = props => (
  <StyledBreadcrumbs separator={<NavigateNextIcon />} {...props}>
    <Link color="inherit" href="/dashboard" onClick={handleClick}>
      <Home/> Dashboard
    </Link>
    <span>Outbreaks</span>
  </StyledBreadcrumbs>
);

/*
 * Light Outlined Button
 */
export const LightBreadcrumbs = styled(Breadcrumbs)`
  color: ${COLORS.LIGHT_BLUE};

  p {
    color: ${COLORS.LIGHT_BLUE};
  }
  
  &:hover {
    color: ${COLORS.LIGHT_BLUE};
  }
`;
