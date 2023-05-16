/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { FC, ImgHTMLAttributes, ReactElement } from 'react';
import MuiLink from '@material-ui/core/Link';
import { Link as RouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(MuiLink)`
  display: flex;
  align-items: center;
`;

const StyledImg = styled.img`
  height: 32px;
  width: auto;
`;

const Link: FC<ReactRouterLinkProps> = (props): ReactElement => (
  <StyledLink color="inherit" {...props} as={RouterLink} />
);

interface HomeButtonProps extends ImgHTMLAttributes<HTMLImageElement> {
  source: string;
  homeUrl?: string;
}

export const HomeButton: FC<HomeButtonProps> = ({ source, homeUrl = '/', ...props }) => (
  <Link to={homeUrl}>
    <StyledImg src={source} alt="logo" {...props} />
  </Link>
);
