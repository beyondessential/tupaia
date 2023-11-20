/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { ButtonBase, Menu, MenuItem, Box, Paper } from '@material-ui/core';
import styled from 'styled-components';
import { Dashboard } from '../../../types';
import { TOP_BAR_HEIGHT } from '../../../constants';
import { ActionsMenu } from './ActionsMenu';

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

const MenuButtonWrapper = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledMenu = styled(Menu)`
  margin: 0 auto 0 2rem;
`;

const StyledPaper = styled(Paper)`
  &.MuiPaper-root {
    background: ${({ theme }) => theme.palette.background.default};
  }
  &.MuiMenu-paper {
    max-height: calc(
      100vh - (${TOP_BAR_HEIGHT} + ${TOP_BAR_HEIGHT})
    ); // 2x top bar height, to make up for any possibly extra in header, e.g. the branch name banner
  }

  .MuiListItem-root {
    &:hover {
      background: #606368;
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
  setSubscribeModalOpen,
}: {
  activeDashboard?: Dashboard;
  dashboards: Dashboard[];
  setExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSubscribeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
        <MenuButtonWrapper>
          <MenuButton onClick={handleClickListItem} disabled={!hasMultipleDashboards}>
            {activeDashboard?.name}
            {hasMultipleDashboards && <KeyboardArrowDownIcon />}
          </MenuButton>
          <ActionsMenu
            setExportModalOpen={setExportModalOpen}
            activeDashboard={activeDashboard}
            setSubscribeModalOpen={setSubscribeModalOpen}
          />
        </MenuButtonWrapper>
      )}
      <StyledMenu
        id="dashboards-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        variant="menu"
        PaperProps={{ component: StyledPaper }}
      >
        {dashboards.map(({ name, code }) => (
          <DashboardMenuItem key={code} dashboardName={name} onClose={handleClose} />
        ))}
      </StyledMenu>
    </>
  );
};
