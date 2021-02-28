/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';

const StyledBanner = styled.div`
  background: #1abc9c;
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 14px;
  text-transform: capitalize;
  text-align: right;
`;

export const EnvBanner = () => {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    return null;
  }

  return <StyledBanner>[{env}]</StyledBanner>;
};
