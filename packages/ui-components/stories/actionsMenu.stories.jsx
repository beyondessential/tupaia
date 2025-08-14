import React from 'react';
import styled from 'styled-components';
import Alert from '@material-ui/lab/Alert';
import MuiBox from '@material-ui/core/Box';
import { ActionsMenu } from '../src/components/ActionsMenu';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ShareIcon from '@material-ui/icons/Share';

export default {
  title: 'ActionsMenu',
};

const Container = styled(MuiBox)`
  padding: 1rem 1rem 1rem 20rem;
`;

const StyledAlert = styled(Alert)`
  margin: 1rem;
`;

export const AllActionsMenu = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);

  return (
    <Container>
      {alertMessage ? <StyledAlert severity="info">{alertMessage}</StyledAlert> : ''}

      <ActionsMenu
        options={[
          { label: 'Uluru', action: () => setAlertMessage('Uluru was selected') },
          { label: 'Taranaki', action: () => setAlertMessage('Taranaki was selected') },
        ]}
      />
    </Container>
  );
};

export const ActionsMenuWithIcons = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);

  return (
    <Container>
      {alertMessage ? <StyledAlert severity="info">{alertMessage}</StyledAlert> : ''}

      <ActionsMenu
        options={[
          { label: 'Export', action: () => setAlertMessage('Export was selected'), ActionIcon: ShareIcon, toolTipTitle: 'Export dashboard' },
          { label: 'Join', action: () => setAlertMessage('Succesfully joined the dashboard mailing list'), ActionIcon: AddCircleOutlineIcon, toolTipTitle: 'Join to receive dashboard email updates', color: 'primary' },
        ]}
        includesIcons={true}
      />
    </Container>
  );
};