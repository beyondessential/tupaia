/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link as BaseLink } from 'react-router-dom';
import styled from 'styled-components';

const Link = styled(BaseLink)`
  text-decoration: none;
  color: inherit;
`;

export const LinkCell = ({ children, id }) => {
  return <Link to={`/tasks/${id}`}>{children}</Link>;
};
