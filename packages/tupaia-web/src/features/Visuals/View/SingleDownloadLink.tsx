import React from 'react';
import styled from 'styled-components';
import { Link } from '@material-ui/core';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { transformDownloadLink } from '../../../utils';

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
  report: ViewReport;
  config: ViewConfig;
}

export const SingleDownloadLink = ({ report: { data = [] }, config }: SingleDownloadLinkProps) => {
  const { value, name: displayName } = data[0] || {};
  const { name } = config || {};
  const formattedValue = transformDownloadLink(value as string);
  return <LinkText href={formattedValue}>{displayName || name}</LinkText>;
};
