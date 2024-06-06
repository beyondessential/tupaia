/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { TableCell as MuiTableCell } from '@material-ui/core';
import { Link, useLocation } from 'react-router-dom';

const Cell = styled(MuiTableCell)`
  font-size: 0.75rem;
  padding: 0;
  border: none;
  position: relative;
  &:first-child {
    padding-inline-start: 1.5rem;
  }
  &:last-child {
    padding-inline-end: 1rem;
  }
`;

const CellContentWrapper = styled.div`
  padding: 0.7rem;
  ${({ $isButtonColumn }) =>
    $isButtonColumn &&
    css`
      padding-inline: 0;
      padding-block: 0;
      text-align: center;
    `}
  height: 100%;
  display: flex;
  align-items: center;

  tr:not(:last-child) & {
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey[400]};
  }
  td:first-child & {
    padding-inline-start: 0.2rem;
  }

  line-height: 1.5;
`;

// Flex does not support ellipsis so we need to have another container to handle the ellipsis
const CellContentContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const HeaderCell = styled(Cell)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[400]};
  padding-block: 0.7rem;
  padding-inline: 0.7rem 0;
  display: flex;
  position: initial; // override this because we have 2 sticky header rows so we will apply sticky to the thead element
  background-color: ${({ theme }) => theme.palette.background.paper};
  .MuiTableSortLabel-icon {
    opacity: 0.5;
  }
  .MuiTableSortLabel-active .MuiTableSortLabel-icon {
    opacity: 1;
  }
`;

const ColResize = styled.div.attrs({
  onClick: e => {
    // suppress other events when resizing
    e.preventDefault();
    e.stopPropagation();
  },
})`
  width: 2rem;
  height: 100%;
  cursor: col-resize;
`;

export const HeaderDisplayCell = ({ children, canResize, getResizerProps, ...props }) => {
  return (
    <HeaderCell {...props} $canResize={canResize}>
      <CellContentContainer> {children}</CellContentContainer>
      {canResize && <ColResize {...getResizerProps()} />}
    </HeaderCell>
  );
};

HeaderDisplayCell.propTypes = {
  children: PropTypes.node,
  width: PropTypes.string,
  canResize: PropTypes.bool,
  getResizerProps: PropTypes.func,
};

HeaderDisplayCell.defaultProps = {
  width: null,
  children: null,
  canResize: false,
  getResizerProps: () => {},
};

export const TableCell = ({ children, width, isButtonColumn, url, ...props }) => {
  const location = useLocation();
  const to = url ? { pathname: url, search: '' } : null;
  // key the search by the pathname so that we can have different search values for different pages, so that if multiple pages have the same column ids, they don't share the same search value
  const newState = url
    ? { prevSearch: { ...location.state?.prevSearch, [location.pathname]: location.search } }
    : null;

  return (
    <Cell $isButtonColumn={isButtonColumn} {...props}>
      <CellContentWrapper $width={width} $isButtonColumn={isButtonColumn}>
        <CellContentContainer
          to={to}
          as={to ? CellLink : 'div'}
          $isButtonColumn={isButtonColumn}
          state={newState}
        >
          {children}
        </CellContentContainer>
      </CellContentWrapper>
    </Cell>
  );
};

TableCell.propTypes = {
  children: PropTypes.node.isRequired,
  width: PropTypes.number,
  isButtonColumn: PropTypes.bool,
  url: PropTypes.string,
};

TableCell.defaultProps = {
  width: null,
  isButtonColumn: false,
  url: null,
};

const CellLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  &:hover {
    tr:has(&) td > * {
      background-color: ${({ theme }) => `${theme.palette.primary.main}18`}; // 18 is 10% opacity
    }
  }
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
  if (matches.some(match => row[match] === null || row[match] === undefined)) return null;
  return matches.reduce((url, match) => url.replace(`:${match}`, row[match]), detailUrl);
};

export const DisplayCell = ({
  row,
  children,
  detailUrl,
  getHasNestedView,
  getNestedViewLink,
  basePath,
  isButtonColumn,
  ...props
}) => {
  const generateLink = () => {
    if (isButtonColumn || (!detailUrl && !getNestedViewLink)) return null;
    if (getHasNestedView && !getHasNestedView(row.original)) return null;
    if (getNestedViewLink) {
      return getNestedViewLink(row.original);
    }
    const formattedUrl = formatDetailUrl(detailUrl, row.original);
    if (!formattedUrl) return null;
    return basePath ? `${basePath}${formattedUrl}` : formattedUrl;
  };
  const url = generateLink();
  return (
    <TableCell {...props} isButtonColumn={isButtonColumn} url={url}>
      {children}
    </TableCell>
  );
};

DisplayCell.propTypes = {
  row: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  detailUrl: PropTypes.string,
  getHasNestedView: PropTypes.func,
  getNestedViewLink: PropTypes.func,
  isButtonColumn: PropTypes.bool,
  basePath: PropTypes.string,
};

DisplayCell.defaultProps = {
  detailUrl: null,
  getHasNestedView: null,
  getNestedViewLink: null,
  isButtonColumn: false,
  basePath: '',
};
