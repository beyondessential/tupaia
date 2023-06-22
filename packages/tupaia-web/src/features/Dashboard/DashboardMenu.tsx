/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { ButtonBase, Menu, MenuItem } from '@material-ui/core';
import { Dashboard } from '@tupaia/types';
import styled from 'styled-components';
import { useDashboards } from '../../api/queries';

const MenuButton = styled(ButtonBase)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.panel.secondaryBackground};
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
`;

interface DashboardMenuItemProps {
  dashboardName: Dashboard['name'];
  onClose: () => void;
}

const DashboardMenuItem = ({ dashboardName, onClose }: DashboardMenuItemProps) => {
  const location = useLocation();
  const { projectCode, entityCode } = useParams();

  const link = { ...location, pathname: `/${projectCode}/${entityCode}/${dashboardName}` };

  return (
    <MenuItem to={link} onClick={onClose} component={Link}>
      {dashboardName}
    </MenuItem>
  );
};

export const DashboardMenu = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { projectCode, entityCode, '*': dashboardName } = useParams();
  const { data: dashboards } = useDashboards(projectCode, entityCode);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedOption = dashboards?.find(({ name }) => name === dashboardName);

  return (
    <>
      <MenuButton onClick={handleClickListItem}>
        {selectedOption?.name}
        <ArrowDropDownIcon />
      </MenuButton>
      <Menu
        id="dashboards-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        variant="menu"
      >
        {dashboards?.map(({ name, code }) => (
          <DashboardMenuItem key={code} dashboardName={name} onClose={handleClose} />
        ))}
      </Menu>
    </>
  );
};
