import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';

interface ButtonLinkProps extends Record<string, any> {
  children?: ReactNode;
}
export const ButtonLink = (props: ButtonLinkProps) => <Button {...props} component={RouterLink} />;
