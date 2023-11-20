/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface RouterLinkProps extends Record<string, any> {
  to: LinkProps['to'];
  children?: ReactNode;
}

export const RouterLink = ({ to, modal, children, ...props }: RouterLinkProps) => {
  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
};
