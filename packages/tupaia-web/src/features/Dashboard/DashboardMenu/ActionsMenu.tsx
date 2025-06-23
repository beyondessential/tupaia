import React from 'react';
import styled from 'styled-components';
import {
  ActionsMenu as BaseActionsMenu,
  ExportIcon,
  ActionsMenuOptionType,
} from '@tupaia/ui-components';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useDashboard, useDashboardMailingList } from '../utils';

const StyledExportIcon = styled(ExportIcon)`
  height: 0.9rem;
`;

const StyledAddCircleOutlineIcon = styled(AddCircleOutlineIcon)`
  height: 1.2rem;
`;

const StyledCheckCircleIcon = styled(CheckCircleIcon)`
  height: 1.2rem;
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
        action: toggleSubscribeModal,
        toolTipTitle: 'Unsubscribe from email updates',
      });
    } else {
      menuOptions.push({
        label: 'Subscribe',
        action: toggleSubscribeModal,
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
