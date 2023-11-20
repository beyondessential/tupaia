/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import {
  ActionsMenu as UIActionsMenu,
  ExportIcon,
  ActionsMenuOptionType,
} from '@tupaia/ui-components';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Dashboard } from '../../../types';
import { useDashboardMailingList } from '../../../utils';

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
    ActionIcon: () => <ExportIcon fill="white" />,
    toolTipTitle: 'Export dashboard',
  };
  menuOptions.push(exportOption);

  if (mailingList) {
    if (mailingList.isSubscribed) {
      menuOptions.push({
        label: 'Subscribed',
        ActionIcon: CheckCircleIcon,
        color: 'primary',
        toolTipTitle: 'Remove yourself from email updates',
        action: () => setSubscribeModalOpen(true),
      });
    } else {
      menuOptions.push({
        label: 'Subscribe',
        action: () => setSubscribeModalOpen(true),
        ActionIcon: AddCircleOutlineIcon,
        toolTipTitle: 'Subscribe to receive dashboard email updates',
      });
    }
  }

  return <UIActionsMenu options={menuOptions} includesIcons={true} />;
};
