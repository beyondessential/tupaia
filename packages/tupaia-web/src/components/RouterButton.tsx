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

export const RouterButton = ({ to, children, ...props }: RouterButtonProps) => {
  const location = useLocation();

  return (
    <Button to={to} component={Link} state={{ backgroundLocation: location }} {...props}>
      {children}
    </Button>
  );
};
