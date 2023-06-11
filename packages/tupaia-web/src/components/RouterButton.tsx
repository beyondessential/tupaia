/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { Link as RouterLink, useLocation, LinkProps } from 'react-router-dom';

const StyledLink = styled(RouterLink)`
  color: white;
  text-transform: none;
  margin-right: 1rem;
  border-radius: 2.5rem;
  padding: 0.3125rem 1.25rem;
`;

interface RouterButtonProps {
  to: LinkProps['to'];
  children?: ReactNode;
}

export const RouterButton = ({ to, children, ...props }: RouterButtonProps) => {
  const location = useLocation();

  return (
    <Button to={to} component={StyledLink} state={{ backgroundLocation: location }} {...props}>
      {children}
    </Button>
  );
};
