/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  CardContent,
  Grid,
  Card,
  CardHeader,
  Divider,
  TextareaAutosize,
  Typography,
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import styled from 'styled-components';

import { ActionsMenu } from './ActionsMenu';
import { Button } from './Button';

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

export const StyledTextareaAutosize = styled(TextareaAutosize)`
  width: 100%;
  border: 0;
  padding: 0;
  height: 50px !important;
  margin-bottom: 1em;
`;

export const StyledButton = styled(Button)`
  position: relative;
  top: 0.8em;
  margin-right: 1em;
`;

export const StyledDivider = styled(Divider)`
  margin: 0 -5%;
`;

const getAvatar = avatarUrl =>
  !avatarUrl ? <AccountCircleIcon style={{ fontSize: 40 }} /> : <Avatar alt="" src={avatarUrl} />;

const getTimestampAndMenu = (dateTime, menuOptions) => (
  <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
    <Grid item xs={4}>
      {format(dateTime, 'dd/MM/yyyy')}
    </Grid>
    <Grid item xs={4}>
      <Box textAlign="right">{format(dateTime, 'hh:mm a')}</Box>
    </Grid>
    <Grid item xs={3}>
      <ActionsMenu options={menuOptions} />
    </Grid>
  </Grid>
);

const MessageView = ({ userMessageId, edit, message, onCancel, onUpdate }) => {
  const textarea = React.useRef(null);

  React.useEffect(() => {
    if (textarea.current) {
      textarea.current.focus();
    }
  }, [edit]);

  return edit ? (
    <div>
      <StyledTextareaAutosize
        ref={textarea}
        className="MuiTypography-root MuiTypography-body2 MuiTypography-colorTextSecondary"
        defaultValue={message}
      />
      <StyledDivider />
      <Typography align="right">
        <StyledButton variant="outlined" color="primary" onClick={onCancel}>
          Cancel
        </StyledButton>
        <StyledButton variant="contained" color="primary" onClick={() => onUpdate(userMessageId)}>
          Update
        </StyledButton>
      </Typography>
    </div>
  ) : (
    <Typography variant="body2" color="textSecondary" component="p">
      {message}
    </Typography>
  );
};

MessageView.propTypes = {
  userMessageId: PropTypes.string.isRequired,
  edit: PropTypes.bool,
  message: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

MessageView.defaultProps = {
  edit: false,
};

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
