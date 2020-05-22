/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, CardContent, Grid, Typography } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { StyledCard, StyledCardHeader } from './styled';

import { ActionsMenu } from './ActionsMenu';

const getAvatar = avatarUrl =>
  !avatarUrl ? <AccountCircleIcon style={{ fontSize: 40 }} /> : <Avatar alt="" src={avatarUrl} />;

const getTimestampAndMenu = (timestamp, menuOptions) => {
  const dt = moment(timestamp);
  return (
    <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
      <Grid item xs={4}>
        {dt.format('DD/MM/YYYY')}
      </Grid>
      <Grid item xs={4}>
        <Box textAlign="right">{dt.format('hh:mm a')}</Box>
      </Grid>
      <Grid item xs={3}>
        <ActionsMenu options={menuOptions} />
      </Grid>
    </Grid>
  );
};

export const UserMessage = ({ id, avatarUrl, title, timestamp, message, onUpdate, onDelete }) => {
  const actions = {
    Edit: () => console.log('UserMessage.edit', id),
    Delete: () => onDelete(id),
  };

  return (
    <StyledCard variant="outlined">
      <StyledCardHeader
        avatar={getAvatar(avatarUrl)}
        title={<Box fontWeight="fontWeightBold">{title}</Box>}
        action={getTimestampAndMenu(timestamp, actions)}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {message}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

UserMessage.propTypes = {
  id: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
  message: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

UserMessage.defaultProps = {
  avatarUrl: null,
};
