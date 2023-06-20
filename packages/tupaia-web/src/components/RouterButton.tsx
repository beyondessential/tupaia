/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { Link, useLocation, LinkProps } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';
import { removeUrlSearchParams } from '../utils';

interface RouterLinkProps extends Record<string, any> {
  to: LinkProps['to'];
  children?: ReactNode;
}

interface ModalButtonProps extends Record<string, any> {
  modal: string;
  children?: ReactNode;
  searchParamsToRemove?: string[]; // search params to remove from url when navigating to modal hash route
}

type RouterButtonProps = RouterLinkProps | ModalButtonProps;

export const RouterButton = ({
  to,
  modal,
  searchParamsToRemove,
  children,
  ...props
}: RouterButtonProps) => {
  const location = useLocation();
  const link = modal
    ? { ...location, hash: modal, search: removeUrlSearchParams(searchParamsToRemove) }
    : to;

  return (
    <Button to={link} component={Link} {...props}>
      {children}
    </Button>
  );
};

export const RouterLink = ({ to, modal, children, ...props }: RouterButtonProps) => {
  const location = useLocation();
  const link = modal ? { ...location, hash: modal } : to;

  return (
    <Link to={link} {...props}>
      {children}
    </Link>
  );
};
