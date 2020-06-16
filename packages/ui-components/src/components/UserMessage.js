/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Card, CardHeader, Divider, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { ActionsMenu } from './ActionsMenu';
import { Button } from './Button';
import { TextField } from './Inputs';

const StyledCard = styled(Card)`
  max-width: 460px;
  box-shadow: ${props => (props.edit ? '0 0 6px #99d6ff' : 'none')};

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

const TextareaField = styled(TextField)`
  margin: 0;

  .MuiInputBase-input {
    padding: 20px;
  }

  .MuiOutlinedInput-notchedOutline {
    border: none;
    border-radius: 0;
  }

  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    box-shadow: none;
    border: none;
  }
`;

const ReadOnlyField = styled(TextareaField)`
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 20px;
`;

const MessageView = ({ userMessageId, edit, message, onCancel, onUpdate }) => {
  return edit ? (
    <React.Fragment>
      <TextareaField
        name="textArea"
        placeholder="Placeholder text"
        multiline
        rows="4"
        autoFocus
        defaultValue={message}
      />
      <Divider />
      <Actions>
        <Button variant="outlined" color="primary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={() => onUpdate(userMessageId)}>
          Update
        </Button>
      </Actions>
    </React.Fragment>
  ) : (
    <ReadOnlyField name="textArea" multiline rows="4" value={message} />
  );
};

MessageView.propTypes = {
  userMessageId: PropTypes.string.isRequired,
  edit: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Title = styled(Typography)`
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: ${props => props.theme.palette.text.primary};
`;

const Date = styled(Title)`
  font-weight: 400;
`;

const Time = styled(Title)`
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
  margin-left: 1rem;
`;

const TimeAndMenu = ({ dateTime, menuOptions }) => (
  <Container>
    <Date>{format(dateTime, 'dd/MM/yyyy')}</Date>
    <Time>{format(dateTime, 'hh:mm a')}</Time>
    <ActionsMenu options={menuOptions} />
  </Container>
);

export const UserMessage = ({ id, avatarUrl, title, dateTime, message, onUpdate, onDelete }) => {
  const [edit, setEdit] = React.useState(false);
  const menuOptions = [
    { label: 'Edit', action: () => setEdit(true) },
    { label: 'Delete', action: () => onDelete(id) },
  ];

  return (
    <StyledCard variant="outlined" edit={edit}>
      <StyledCardHeader
        avatar={<Avatar src={avatarUrl} />}
        title={<Title>{title}</Title>}
        action={<TimeAndMenu dateTime={dateTime} menuOptions={menuOptions} />}
      />
      <MessageView
        userMessageId={id}
        edit={edit}
        message={message}
        onCancel={() => setEdit(false)}
        onUpdate={onUpdate}
      />
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
