/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link } from '@material-ui/core';
import { ViewConfig } from '@tupaia/types';
import { transformDownloadLink } from './utils';

const LinkText = styled(Link).attrs({
  download: true,
  target: '_blank',
  rel: 'noreferrer noopener',
})`
  font-size: 1.25rem;
  text-align: center;
  text-decoration: underline;
`;
interface SingleDateProps {
  data: Record<string, any> & {
    value: string;
  };
  config: ViewConfig;
}

export const SingleDownloadLink = ({ data, config }: SingleDateProps) => {
  const { value } = data;
  const { name } = config;
  const formattedValue = transformDownloadLink(value);
  return <LinkText href={formattedValue}>{name}</LinkText>;
};
