/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link } from '@material-ui/core';
import { ViewConfig } from '@tupaia/types';
import { ViewDataItem } from '../../types';

const LinkText = styled(Link).attrs({
  download: true,
  target: '_blank',
  rel: 'noreferrer noopener',
})`
  font-size: 1.25rem;
  text-align: center;
  text-decoration: underline;
  &:not(:only-of-type) {
    margin-bottom: 1rem;
  }
`;
interface SingleDownloadLinkProps {
  data?: ViewDataItem[];
  config: ViewConfig;
}

const transformDownloadLink = (resourceUrl: string) => {
  const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8080/api/v1/';
  if (resourceUrl.includes('http')) return resourceUrl;
  return `${baseUrl}${resourceUrl}`;
};

export const SingleDownloadLink = ({ data, config }: SingleDownloadLinkProps) => {
  const { value } = data![0];
  const { name } = config;
  const formattedValue = transformDownloadLink(value as string);
  return <LinkText href={formattedValue}>{name}</LinkText>;
};
