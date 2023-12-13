/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import {
  ActionsMenu as BaseActionsMenu,
  ExportIcon,
  ActionsMenuOptionType,
} from '@tupaia/ui-components';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Dashboard } from '../../../types';
import { useDashboardMailingList } from '../../../utils';

const StyledExportIcon = styled(ExportIcon)`
  height: 0.9rem;
`;

const StyledAddCircleOutlineIcon = styled(AddCircleOutlineIcon)`
  height: 1.2rem;
`;

const StyledCheckCircleIcon = styled(CheckCircleIcon)`
  height: 1.2rem;
`;

interface ActionsMenuProps {
  setExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeDashboard?: Dashboard;
  setSubscribeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ActionsMenu = ({
  setExportModalOpen,
  activeDashboard,
  setSubscribeModalOpen,
}: ActionsMenuProps) => {
  const mailingList = useDashboardMailingList();

  if (!activeDashboard) {
    return null;
  }

  const menuOptions: ActionsMenuOptionType[] = [];
  const exportOption: ActionsMenuOptionType = {
    label: 'Export',
    action: () => setExportModalOpen(true),
    // eslint-disable-next-line react/display-name
    ActionIcon: () => <StyledExportIcon fill="white" />,
    toolTipTitle: 'Export dashboard',
  };
  menuOptions.push(exportOption);

  if (mailingList) {
    if (mailingList.isSubscribed) {
      menuOptions.push({
        label: 'Subscribed',
        ActionIcon: StyledCheckCircleIcon,
        color: 'primary',
        toolTipTitle: 'Remove yourself from email updates',
        action: () => setSubscribeModalOpen(true),
      });
    } else {
      menuOptions.push({
        label: 'Subscribe',
        action: () => setSubscribeModalOpen(true),
        ActionIcon: StyledAddCircleOutlineIcon,
        toolTipTitle: 'Subscribe to receive dashboard email updates',
      });
    }
  }

  const styledMenuOptions: ActionsMenuOptionType[] = menuOptions.map(menuOption => ({
    ...menuOption,
    style: { fontSize: '0.9rem' },
    iconStyle: { minWidth: '2rem' },
  }));

  return (
    <BaseActionsMenu
      options={styledMenuOptions}
      includesIcons={true}
      anchorOrigin={{ horizontal: 'right' }}
    />
  );
};
