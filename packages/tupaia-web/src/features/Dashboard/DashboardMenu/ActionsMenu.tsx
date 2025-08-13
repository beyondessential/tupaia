import {
  Upload as ExportIcon,
  CircleCheck as SubscribedIcon,
  MailPlus as SubscribeIcon,
} from 'lucide-react';
import React from 'react';

import { ActionsMenuOptionType, ActionsMenu as BaseActionsMenu } from '@tupaia/ui-components';
import { useDashboardContext, useDashboardMailingList } from '../utils';

const GREEN_100 = '#47ca80';

export const ActionsMenu = () => {
  const { toggleExportModal, toggleSubscribeModal, activeDashboard } = useDashboardContext();
  const mailingList = useDashboardMailingList();

  if (!activeDashboard) {
    return null;
  }

  const menuOptions: ActionsMenuOptionType[] = [];
  const exportOption: ActionsMenuOptionType = {
    label: 'Export',
    action: toggleExportModal,
    actionIcon: <ExportIcon />,
    toolTipTitle: 'Export dashboard',
  };
  menuOptions.push(exportOption);

  if (mailingList) {
    if (mailingList.isSubscribed) {
      menuOptions.push({
        label: 'Subscribed',
        action: toggleSubscribeModal,
        actionIcon: <SubscribedIcon color={GREEN_100} />,
        toolTipTitle: 'Unsubscribe from email updates',
      });
    } else {
      menuOptions.push({
        label: 'Subscribe',
        action: toggleSubscribeModal,
        actionIcon: <SubscribeIcon />,
        toolTipTitle: 'Subscribe to receive dashboard email updates',
      });
    }
  }

  const styledMenuOptions: ActionsMenuOptionType[] = menuOptions.map(menuOption => ({
    ...menuOption,
    style: { fontSize: '0.9rem' },
    iconStyle: {
      fontSize: '1.125rem',
      minWidth: '2rem',
    },
  }));

  return (
    <BaseActionsMenu
      options={styledMenuOptions}
      includesIcons={true}
      anchorOrigin={{ horizontal: 'right' }}
    />
  );
};
