/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { ButtonBase, Menu, MenuItem } from '@material-ui/core';
import styled from 'styled-components';
import { PANEL_GREY } from '../../constants';
import { useDashboards } from '../../api/queries';
import { DashboardCode } from '../../types';

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

export const DashboardDropdown = () => {
  const location = useLocation();
  const { projectCode, entityCode, '*': dashboardCode } = useParams();
  const { data: dashboardData } = useDashboards(projectCode, entityCode);
  const options = dashboardData?.map(({ code, name }) => ({ value: code, label: name }));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const getLink = (code: DashboardCode) => {
    return { ...location, pathname: `/${projectCode}/${entityCode}/${code}` };
  };

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = () => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedOption = options?.find(({ value: optionValue }) => optionValue === dashboardCode);
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
        {options?.map(({ label, value: optionValue }) => (
          <MenuItem
            key={optionValue}
            to={getLink(optionValue)}
            onClick={handleMenuItemClick}
            component={Link}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
