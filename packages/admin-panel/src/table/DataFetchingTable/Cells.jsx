/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TableCell as MuiTableCell } from '@material-ui/core';
import { Link } from 'react-router-dom';

const BUTTON_COLUMN_WIDTH = '4.5rem';

const Cell = styled(MuiTableCell)`
  vertical-align: middle;
  font-size: 0.75rem;
  padding: 0;
  max-width: ${({ $isButtonColumn }) => ($isButtonColumn ? BUTTON_COLUMN_WIDTH : '0')};
  width: ${({ $isButtonColumn }) => ($isButtonColumn ? BUTTON_COLUMN_WIDTH : 'auto')};
  border: none;
  height: 1px; // need this to make the cell content fill the height of the cell
  &:first-child {
    padding-inline-start: 1.5rem;
  }
  &:last-child {
    padding-inline-end: 1.5rem;
  }
`;

const CellContentWrapper = styled.div`
  padding: ${({ $shouldCenterContent }) => ($shouldCenterContent ? '0' : '0.7rem')};
  height: 100%;
  display: flex;
  align-items: center;
  text-align: ${({ $shouldCenterContent }) => ($shouldCenterContent ? 'center' : 'left')};

  tr:not(:last-child) & {
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey[400]};
  }
  td:first-child & {
    padding-inline-start: 0.2rem;
  }

  line-height: 1.5;

  ${({ $width }) => $width && `width: ${$width}`};
`;

// Flex does not support ellipsis so we need to have another container to handle the ellipsis
const CellContentContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const HeaderCell = styled(Cell)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[400]};
  padding-block: 0.7rem;
  padding-inline: 0.7rem 0;
  position: initial; // override this because we have 2 sticky header rows so we will apply sticky to the thead element
  background-color: ${({ theme }) => theme.palette.background.paper};
  .MuiTableSortLabel-icon {
    opacity: 1;
  }
  // apply a min width to the button column to prevent it from shrinking the filter input too much
  ${({ $isButtonColumn }) => !$isButtonColumn && `min-width: 9rem;`};
`;

export const HeaderDisplayCell = ({ children, isButtonColumn, width, ...props }) => {
  return (
    <HeaderCell $isButtonColumn={isButtonColumn} $width={width} {...props}>
      <CellContentContainer> {children}</CellContentContainer>
    </HeaderCell>
  );
};

HeaderDisplayCell.propTypes = {
  children: PropTypes.node,
  isButtonColumn: PropTypes.bool,
  width: PropTypes.string,
};

HeaderDisplayCell.defaultProps = {
  isButtonColumn: false,
  width: null,
  children: null,
};

export const TableCell = ({ children, width, isButtonColumn, url }) => {
  return (
    <Cell $isButtonColumn={isButtonColumn}>
      <CellContentWrapper $width={width} $shouldCenterContent={isButtonColumn}>
        <CellContentContainer to={url} as={url ? CellLink : 'div'}>
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
  &:hover,
  &:focus {
    tr:has(&) td > * {
      background-color: ${({ theme }) => `${theme.palette.primary.main}33`};
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
