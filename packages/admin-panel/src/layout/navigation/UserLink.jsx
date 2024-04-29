/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { WHITE } from '../../theme/colors';

export const UserLink = styled(Link)`
  font-size: 0.6875rem;
  margin-block-start: 0.5rem;
  text-decoration: none;
  color: ${WHITE};
  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;
