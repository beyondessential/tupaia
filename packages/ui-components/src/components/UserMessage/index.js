/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, CardContent, Grid, Card, CardHeader } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import styled from 'styled-components';

import { ActionsMenu } from '../ActionsMenu';
import { MessageView } from './MessageView';

const StyledCard = styled(Card)`
  max-width: 460px;

  .MuiCardHeader-root {
    padding: 8px 16px;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #dedee0;
  }
`;

const StyledCardHeader = styled(CardHeader)`
  .MuiCardHeader-action {
    flex: 1 1 auto;
    align-self: center;
    margin-top: 0;
  }
`;

const getAvatar = avatarUrl =>
  !avatarUrl ? <AccountCircleIcon style={{ fontSize: 40 }} /> : <Avatar alt="" src={avatarUrl} />;

const getTimestampAndMenu = (dateTime, menuOptions) => (
  <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
    <Grid item xs={4}>
      {format(dateTime, 'DD/MM/YYYY')}
    </Grid>
    <Grid item xs={4}>
      <Box textAlign="right">{format(dateTime, 'hh:mm a')}</Box>
    </Grid>
    <Grid item xs={3}>
      <ActionsMenu options={menuOptions} />
    </Grid>
  </Grid>
);

export const UserMessage = ({ id, avatarUrl, title, dateTime, message, onUpdate, onDelete }) => {
  const [edit, setEdit] = React.useState(false);
  const menuOptions = [
    { label: 'Edit', action: () => setEdit(true) },
    { label: 'Delete', action: () => onDelete(id) },
  ];

  return (
    <StyledCard variant="outlined">
      <StyledCardHeader
        avatar={getAvatar(avatarUrl)}
        title={<Box fontWeight="fontWeightBold">{title}</Box>}
        action={getTimestampAndMenu(dateTime, menuOptions)}
      />
      <CardContent>
        <MessageView
          userMessageId={id}
          edit={edit}
          message={message}
          onCancel={() => setEdit(false)}
          onUpdate={onUpdate}
        />
      </CardContent>
    </StyledCard>
  );
};

UserMessage.propTypes = {
  id: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
  message: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

UserMessage.defaultProps = {
  avatarUrl: null,
};
