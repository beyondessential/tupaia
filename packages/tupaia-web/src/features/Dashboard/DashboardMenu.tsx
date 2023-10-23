/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { ButtonBase, Menu, MenuItem, Box, Button } from '@material-ui/core';
import { ActionsMenu } from '@tupaia/ui-components';
import GetAppIcon from '@material-ui/icons/GetApp';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ShareIcon from '@material-ui/icons/Share';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import styled from 'styled-components';
import { Dashboard } from '../../types';
import { TOP_BAR_HEIGHT } from '../../constants';

const MenuButton = styled(ButtonBase)`
  display: flex;
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;

  .MuiSvgIcon-root {
    margin-left: 0.5rem;
  }
`;

const ExportButton = styled(Button).attrs({
  variant: 'outlined',
})`
  font-size: 0.6875rem;
`;

const ItemButton = styled(Menu)`
  margin: 0 auto 0 2rem;

  .MuiPaper-root {
    background: ${({ theme }) => theme.palette.background.default};
  }
  .MuiMenu-paper {
    max-height: calc(
      100vh - (${TOP_BAR_HEIGHT} + ${TOP_BAR_HEIGHT})
    ); // 2x top bar height, to make up for any possibly extra in header, e.g. the branch name banner
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
  const { projectCode, entityCode, dashboardName: selectedDashboardName } = useParams();

  const encodedDashboardName = encodeURIComponent(dashboardName);
  const link = {
    ...location,
    pathname: `/${projectCode}/${entityCode}/${encodedDashboardName}`,
  };

  return (
    <MenuItem
      to={link}
      onClick={onClose}
      component={Link}
      selected={dashboardName === selectedDashboardName}
    >
      {dashboardName}
    </MenuItem>
  );
};

export const DashboardMenu = ({
  activeDashboard,
  dashboards,
  setExportModalOpen,
  isJoined,
  handleJoinClick
}: {
  activeDashboard?: Dashboard;
  dashboards: Dashboard[];
  setExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isJoined: boolean;
  handleJoinClick: Function;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);


  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const hasMultipleDashboards = dashboards.length > 1;
  const joinedMenuOptions = [
    { label: 'Export', action: () => setExportModalOpen(true), ActionIcon: ShareIcon, toolTipTitle: 'Export dashboard' },
    { label: 'Joined', action: () => handleJoinClick(false), ActionIcon: CheckCircleIcon, toolTipTitle: 'Remove yourself from email updates', color: 'primary' },
  ]

  const defaultMenuOptions = [
    { label: 'Export', action: () => setExportModalOpen(true), ActionIcon: GetAppIcon, toolTipTitle: 'Export dashboard' },
    { label: 'Join', action: () => handleJoinClick(true), ActionIcon: AddCircleOutlineIcon, toolTipTitle: 'Join to receive dashboard email updates' },
  ]
  return (
    <>
      {activeDashboard && (
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
          <MenuButton onClick={handleClickListItem} disabled={!hasMultipleDashboards}>
            {activeDashboard?.name}
            {hasMultipleDashboards && <KeyboardArrowDownIcon />}
          </MenuButton>
          <ActionsMenu options={isJoined ? joinedMenuOptions : defaultMenuOptions} includesIcons={true} />
        </Box>
      )}

      <ItemButton
        id="dashboards-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        variant="menu"
        disablePortal
      >
        {dashboards.map(({ name, code }) => (
          <DashboardMenuItem key={code} dashboardName={name} onClose={handleClose} />
        ))}
      </ItemButton>
      
    </>
  );
};
