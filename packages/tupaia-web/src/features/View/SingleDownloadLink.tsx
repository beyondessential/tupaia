/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link } from '@material-ui/core';
import { ViewConfig } from '@tupaia/types';
import { transformDownloadLink } from './utils';
import { ViewReport } from '../../types';

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
  report: ViewReport;
  config: ViewConfig;
}

export const SingleDownloadLink = ({ report, config }: SingleDateProps) => {
  const { value } = report?.data[0];
  const { name } = config;
  const formattedValue = transformDownloadLink(value as string);
  return <LinkText href={formattedValue}>{name}</LinkText>;
};
