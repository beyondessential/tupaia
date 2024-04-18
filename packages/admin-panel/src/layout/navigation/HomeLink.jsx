/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link as BaseLink } from 'react-router-dom';
import styled from 'styled-components';
import { WHITE } from '../../theme/colors';

const Link = styled(BaseLink)`
  padding-inline: 0.625rem;
  padding-block: 0.625rem;
  height: 4rem;
  display: block;
  border-radius: 4px;
  border: 1px solid transparent;
  img {
    display: block;
    height: 100%;
    max-height: 100%;
  }
  &:hover {
    background-color: ${WHITE}33; // 33 is 20% opacity
  }
  &:focus {
    border-color: ${WHITE};
  }
`;

export const HomeLink = () => (
  <Link to="/">
    <img src="/admin-panel-logo-white.svg" alt="Tupaia Admin Panel logo" />
  </Link>
);
