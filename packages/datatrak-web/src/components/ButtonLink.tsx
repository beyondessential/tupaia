import React, { AnchorHTMLAttributes, RefAttributes } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Button, ButtonProps } from '@tupaia/ui-components';

export const ButtonLink = (
  props: Omit<ButtonProps, 'component'> & LinkProps & RefAttributes<HTMLAnchorElement>,
) => <Button {...props} component={Link} />;

export const ButtonAnchor = (
  props: Omit<ButtonProps, 'component'> & AnchorHTMLAttributes<HTMLAnchorElement>,
) => <Button {...props} component="a" />;
