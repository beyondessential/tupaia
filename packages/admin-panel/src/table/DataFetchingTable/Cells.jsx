import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useLinkWithSearchState } from '../../utilities';

// Flex does not support ellipsis so we need to have another container to handle the ellipsis
const CellContentContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

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
  const { to, newState } = useLinkWithSearchState(url);
  return (
    <CellContentContainer
      to={to}
      as={url ? CellLink : 'div'}
      $isButtonColumn={isButtonColumn}
      state={newState}
    >
      {children}
    </CellContentContainer>
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
