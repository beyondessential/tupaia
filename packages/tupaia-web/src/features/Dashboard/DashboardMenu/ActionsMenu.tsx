import React from 'react';
import styled from 'styled-components';
import { ActionsMenu as BaseActionsMenu, ActionsMenuOptionType } from '@tupaia/ui-components';
import { Upload as ExportIcon, MailPlus, MailCheck } from 'lucide-react';
import { useDashboard, useDashboardMailingList } from '../utils';

const StyledExportIcon = styled(ExportIcon)`
  font-size: 1.125rem;
`;

const SubscribeIcon = styled(MailPlus)`
  font-size: 1.125rem;
`;

const SubscribedIcon = styled(MailCheck)`
  font-size: 1.125rem;
`;

export const ActionsMenu = () => {
  const { toggleExportModal, toggleSubscribeModal, activeDashboard } = useDashboard();
  const mailingList = useDashboardMailingList();

  if (!activeDashboard) {
    return null;
  }

  const menuOptions: ActionsMenuOptionType[] = [];
  const exportOption: ActionsMenuOptionType = {
    label: 'Export',
    action: toggleExportModal,
    // eslint-disable-next-line react/display-name
    ActionIcon: StyledExportIcon,
    toolTipTitle: 'Export dashboard',
  };
  menuOptions.push(exportOption);

  if (mailingList) {
    if (mailingList.isSubscribed) {
      menuOptions.push({
        label: 'Subscribed',
        ActionIcon: SubscribedIcon,
        color: 'primary',
        action: toggleSubscribeModal,
        toolTipTitle: 'Unsubscribe from email updates',
      });
    } else {
      menuOptions.push({
        label: 'Subscribe',
        action: toggleSubscribeModal,
        ActionIcon: SubscribeIcon,
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
