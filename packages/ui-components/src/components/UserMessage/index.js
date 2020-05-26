/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, CardContent, Grid } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { StyledCard, StyledCardHeader } from './styled';

import { ActionsMenu } from './ActionsMenu';
import { MessageView } from './MessageView';

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

  return (
    <StyledCard variant="outlined">
      <StyledCardHeader
        avatar={getAvatar(avatarUrl)}
        title={<Box fontWeight="fontWeightBold">{title}</Box>}
        action={getTimestampAndMenu(dateTime, {
          Edit: () => setEdit(true),
          Delete: () => onDelete(id),
        })}
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
