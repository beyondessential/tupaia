/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Avatar, Typography } from '@material-ui/core';
import { ActionsMenu } from './ActionsMenu';
import { Button, OutlinedButton } from './Button';
import { Card } from './Card';
import { TextField } from './Inputs';

const TextareaField = styled(TextField)`
  margin: 0;

  .MuiInputBase-input {
    padding: 1.25rem;
    color: #888888;
    line-height: 1.5;
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

const MessageView = ({ edit, message }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (edit) {
      const input = inputRef.current;
      const length = input.value.length;
      input.setSelectionRange(length, length);
      input.focus();
    }
  }, [edit, inputRef]);

  if (!edit) {
    return (
      <ReadOnlyField
        name="textArea"
        multiline
        value={message}
        InputProps={{
          readOnly: true,
        }}
      />
    );
  }

  return (
    <TextareaField
      inputRef={inputRef}
      name="textArea"
      placeholder="Placeholder text"
      multiline
      defaultValue={message}
    />
  );
};

MessageView.propTypes = {
  edit: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
};

const Flexbox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Header = styled(Flexbox)`
  padding: 0.8rem 0.5rem 0.8rem 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-left: 0.5rem;
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

const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const UserMessage = ({ user, message, onUpdate, onDelete }) => {
  const [edit, setEdit] = useState(false);
  const date = format(message.dateTime, 'dd/MM/yyyy');
  const time = format(message.dateTime, 'hh:mm a');

  const handleUpdate = () => {
    onUpdate(message);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  const menuOptions = [
    { label: 'Edit', action: () => setEdit(true) },
    { label: 'Delete', action: () => onDelete(message.id) },
  ];

  return (
    <Card variant="outlined" edit={edit}>
      <Header>
        <Flexbox>
          <Avatar src={user.avatarUrl} />
          <Title>{user.title}</Title>
        </Flexbox>
        <Flexbox>
          <Date>{date}</Date>
          <Time>{time}</Time>
          <ActionsMenu options={menuOptions} />
        </Flexbox>
      </Header>
      <MessageView edit={edit} message={message.content} />
      {edit && (
        <CardActions>
          <OutlinedButton onClick={handleCancel}>Cancel</OutlinedButton>
          <Button onClick={handleUpdate}>Update</Button>
        </CardActions>
      )}
    </Card>
  );
};

UserMessage.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
  }).isRequired,
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dateTime: PropTypes.instanceOf(Date).isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
