/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { HomeLink, UserLink } from '../../layout';

const Wrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  padding-block: 0.3rem;
  padding-inline: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${UserLink} {
    font-size: 0.875rem;
  }
`;

export const NavPanel = () => {
  return (
    <Wrapper>
      <HomeLink />
      <UserLink to="/logout">Logout</UserLink>
    </Wrapper>
  );
};
