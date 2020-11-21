/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import PropTypes from 'prop-types';

const FlexRow = styled.div`
  display: flex;
  align-items: center;

  .MuiSvgIcon-root {
    font-size: 18px;
  }
`;

const getSortIcon = className => {
  if (className.includes('-sort-asc')) {
    return ExpandLessIcon;
  }
  if (className.includes('-sort-desc')) {
    return ExpandMoreIcon;
  }
  if (className.includes('-cursor-pointer')) {
    return UnfoldMoreIcon;
  }

  return null;
};

export const TableHeadCell = ({ toggleSort, className, children, ...props }) => {
  const SortIcon = getSortIcon(className);
  return (
    <FlexRow
      className={`rt-th ${className.includes('-cursor-pointer') ? '-cursor-pointer' : ''}`}
      onClick={e => toggleSort && toggleSort(e)}
      {...props}
    >
      {SortIcon && <SortIcon />}
      {children}
    </FlexRow>
  );
};

TableHeadCell.propTypes = {
  toggleSort: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

TableHeadCell.defaultProps = {
  className: null,
  children: null,
  toggleSort: null,
};
