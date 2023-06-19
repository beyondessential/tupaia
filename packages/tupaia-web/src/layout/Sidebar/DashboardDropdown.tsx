/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { ButtonBase, Menu, MenuItem } from '@material-ui/core';
import styled from 'styled-components';

const PANEL_GREY = '#4a4b55';

const Dropdown = styled(ButtonBase)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${PANEL_GREY};
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  text-align: left;
`;

export const DashboardDropdown = ({ options = [], onChange, value }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (options.length > 0) {
      onChange(options[0].value);
    }
  }, [JSON.stringify(options)]);
  const handleClickListItem = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, value) => {
    setAnchorEl(null);
    onChange(value);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedOption = options.find(({ value: optionValue }) => optionValue === value);
  return (
    <div>
      <Dropdown onClick={handleClickListItem}>
        <div>{selectedOption?.label}</div>
        <ArrowDropDownIcon />
      </Dropdown>
      <Menu
        id="dashboards"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        variant="menu"
      >
        {options.map(({ label, value: optionValue }) => (
          <MenuItem
            key={optionValue}
            selected={optionValue === value}
            onClick={event => handleMenuItemClick(event, optionValue)}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
