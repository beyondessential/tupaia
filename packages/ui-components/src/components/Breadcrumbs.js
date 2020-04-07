/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Home from '@material-ui/icons/Home';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../theme/colors';
import styled from 'styled-components';

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export const Breadcrumbs = props => (
  <MuiBreadcrumbs separator={<NavigateNextIcon />} {...props}>
    <Link color="inherit" href="/dashboard" onClick={handleClick}>
      <Home/> Dashboard
    </Link>
    <Typography>Outbreaks</Typography>
  </MuiBreadcrumbs>
);

/*
 * Light Outlined Button
 */
export const LightBreadcrumbs = styled(Breadcrumbs)`
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.7);

  p {
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .MuiLink-root {
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 5px;
    }
  }

  .MuiBreadcrumbs-separator {
    margin-left: 0;
    margin-right: 0;

    svg {
      font-size: 1rem;
    }
  }

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
`;
