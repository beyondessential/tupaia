/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const CellLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const formatDetailUrl = (detailUrl, row) => {
  if (!detailUrl) {
    return null;
  }
  const regexp = new RegExp(/(?<=:)(.*?)(?=\/|$)/, 'gi');
  const matches = detailUrl.match(regexp);
  if (!matches) {
    return detailUrl;
  }
  return matches.reduce((url, match) => url.replace(`:${match}`, row[match]), detailUrl);
};

export const CellContent = ({ row, detailUrl, children }) => {
  if (!detailUrl) return children;
  const formattedDetailUrl = formatDetailUrl(detailUrl, row.original);
  const resolvedPath = `${location.pathname}${formattedDetailUrl}`;

  return <CellLink to={resolvedPath}>{children}</CellLink>;
};

CellContent.propTypes = {
  row: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  detailUrl: PropTypes.string,
};

CellContent.defaultProps = {
  detailUrl: null,
};
