import React, { ImgHTMLAttributes } from 'react';
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

const Link = (props: ReactRouterLinkProps) => (
  <StyledLink color="inherit" {...props} as={RouterLink} />
);

interface HomeButtonProps extends ImgHTMLAttributes<HTMLImageElement> {
  source: string;
  homeUrl?: string;
}

export const HomeButton = ({ source, homeUrl = '/', ...props }: HomeButtonProps) => (
  <Link to={homeUrl}>
    <StyledImg src={source} alt="logo" {...props} />
  </Link>
);
