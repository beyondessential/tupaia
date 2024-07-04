/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Container = styled.div``;

const MenuButton = styled(IconButton)`
  margin-inline-start: 0.5rem;
  color: white;
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

export const RowHeaderCell = ({ rowIndex, addNewRow, removeRow }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Wrapper>
        <Container>{rowIndex + 1}</Container>
        <MenuButton size="small" onClick={handleClick}>
          <MoreVert />
        </MenuButton>
      </Wrapper>
      <Menu id="row-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => addNewRow(rowIndex)}>Add row above</MenuItem>
        <MenuItem onClick={() => addNewRow(rowIndex + 1)}>Add row below</MenuItem>
        <MenuItem onClick={() => removeRow(rowIndex)}>Delete row</MenuItem>
      </Menu>
    </>
  );
};

RowHeaderCell.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  addNewRow: PropTypes.func.isRequired,
  removeRow: PropTypes.func.isRequired,
};
