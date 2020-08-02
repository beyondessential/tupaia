/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import PropTypes from 'prop-types';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
`;

const SortIcon = styled(UnfoldMoreIcon)`
  font-size: 18px;
`;

export const TableHeadCell = ({ toggleSort, className, children, ...props }) => {
  const isSortable = className.includes('-cursor-pointer');
  return (
    <FlexRow
      className={`rt-th ${isSortable && '-cursor-pointer'}`}
      onClick={e => toggleSort && toggleSort(e)}
      {...props}
    >
      {isSortable && <SortIcon />}
      {children}
    </FlexRow>
  );
};

TableHeadCell.propTypes = {
  toggleSort: PropTypes.func,
  children: PropTypes.any,
  className: PropTypes.string,
};

TableHeadCell.defaultProps = {
  className: null,
  children: null,
  toggleSort: null,
};
