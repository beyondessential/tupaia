/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { Link, useLocation, LinkProps } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';

interface RouterButtonProps extends Record<string, any> {
  to: LinkProps['to'];
  children?: ReactNode;
}

export const RouterButton = ({ to, modal, children, ...props }: RouterButtonProps) => {
  const location = useLocation();

  const link = modal ? { pathname: location.pathname, hash: modal } : to;

  return (
    <Button to={link} component={Link} state={{ backgroundLocation: location }} {...props}>
      {children}
    </Button>
  );
};
