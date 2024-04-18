/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { HomeLink } from '../../layout';

const Wrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  padding: 0.625rem;
  display: flex;
  justify-content: space-between;
`;

export const NavPanel = () => {
  return (
    <Wrapper>
      <HomeLink />
    </Wrapper>
  );
};
