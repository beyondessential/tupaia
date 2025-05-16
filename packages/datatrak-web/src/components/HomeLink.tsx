import React from 'react';
import styled from 'styled-components';
import { Link, LinkProps } from 'react-router-dom';

import { DataTrakLogotype } from './DataTrakLogotype';

const Logotype = styled(DataTrakLogotype)`
  block-size: 100%;
  inline-size: auto;
`;

interface HomeLink extends Omit<LinkProps, 'to'> {
  to?: LinkProps['to'];
}

export const HomeLink = ({ ...props }: HomeLink) => {
  return (
    <Link to="/" {...props}>
      <Logotype titleAccess="Tupaia DataTrak – Home" width={84} height={41} />
    </Link>
  );
};
