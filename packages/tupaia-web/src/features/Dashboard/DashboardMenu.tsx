/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { ButtonBase, Menu, MenuItem } from '@material-ui/core';
import styled from 'styled-components';
import { Dashboard } from '../../types';

const MenuButton = styled(ButtonBase)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.palette.background.paper};
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;

  .MuiSvgIcon-root {
    margin-left: 0.5rem;
  }
`;

const ItemButton = styled(Menu)`
  margin: 3.125rem auto 0 2rem;

  .MuiPaper-root {
    background: ${({ theme }) => theme.palette.background.default};
  }

  .MuiListItem-root {
    &:hover {
      background: #606368;
    }
  }
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

export const DashboardMenu = ({
  activeDashboard,
  dashboards,
}: {
  activeDashboard?: Dashboard;
  dashboards: Dashboard[];
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const hasMultipleDashboards = dashboards.length > 1;

  return (
    <>
      {activeDashboard && (
        <MenuButton onClick={handleClickListItem} disabled={!hasMultipleDashboards}>
          {activeDashboard?.name}
          {hasMultipleDashboards && <KeyboardArrowDownIcon />}
        </MenuButton>
      )}

      <ItemButton
        id="dashboards-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        variant="menu"
      >
        {dashboards.map(({ name, code }) => (
          <DashboardMenuItem key={code} dashboardName={name} onClose={handleClose} />
        ))}
      </ItemButton>
    </>
  );
};
