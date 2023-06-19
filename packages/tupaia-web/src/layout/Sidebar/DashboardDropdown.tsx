/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { ButtonBase, Menu, MenuItem } from '@material-ui/core';
import styled from 'styled-components';
import { PANEL_GREY } from '../../constants';

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

interface DashboardDropdownProps {
  options?: { label: string; value: string }[];
  onChange: (value: string) => void;
  value: string | null;
}

export const DashboardDropdown = ({ options = [], onChange, value }: DashboardDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (options.length > 0) {
      onChange(options[0].value);
    }
  }, [JSON.stringify(options)]);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (_event: React.MouseEvent, value: string) => {
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
