import { Box, ButtonBase, Menu, MenuItem, Paper } from '@material-ui/core';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useDashboards } from '../../../api/queries';
import { TOP_BAR_HEIGHT } from '../../../constants';
import { Dashboard } from '../../../types';
import { useDashboardContext } from '../utils';
import { ActionsMenu } from './ActionsMenu';

const MenuButton = styled(ButtonBase)`
  display: flex;
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding-block: 1rem;
  padding-inline: 2rem;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;
`;

const DisclosureIcon = styled(ChevronDown)`
  margin-inline-start: 0.5rem;
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

  .MuiListItem-root:hover {
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

  const pathname = `/${projectCode}/${entityCode}/${encodeURIComponent(dashboardName)}`;

  return (
    <MenuItem
      to={{ ...location, pathname }}
      onClick={onClose}
      component={Link}
      selected={dashboardName === selectedDashboardName}
    >
      {dashboardName}
    </MenuItem>
  );
};

export const DashboardMenu = () => {
  const { projectCode, entityCode } = useParams();
  const { activeDashboard } = useDashboardContext();
  const { data: dashboards = [] } = useDashboards(projectCode, entityCode);
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
            {hasMultipleDashboards && <DisclosureIcon />}
          </MenuButton>
          <ActionsMenu />
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
