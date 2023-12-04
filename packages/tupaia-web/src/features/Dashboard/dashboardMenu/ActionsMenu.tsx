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
import { useParams } from 'react-router';
import { Dashboard } from '../../../types';
import { useMailingList } from './useMailingList';

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
  const { entityCode } = useParams();

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

  const { hasMailingList, isSubscribed } = useMailingList(activeDashboard, entityCode);

  if (hasMailingList) {
    if (isSubscribed) {
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
