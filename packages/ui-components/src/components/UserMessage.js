/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
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

const MessageView = ({ status, message }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (status === STATUS.EDITING) {
      const input = inputRef.current;
      const length = input.value.length;
      input.setSelectionRange(length, length);
      input.focus();
    }
  }, [status, inputRef]);

  if (status === STATUS.READ_ONLY) {
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
  status: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

const StyledCard = styled(({ focus, ...props }) => <Card {...props} />)`
  box-shadow: ${props => (props.focus ? `0 0 6px ${props.theme.palette.secondary.light}` : 'none')};
`;

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

const STATUS = {
  READ_ONLY: 'readOnly',
  LOADING: 'loading',
  EDITING: 'editing',
};

export const UserMessage = ({ user, message, onUpdate, onDelete, className }) => {
  const [status, setStatus] = useState(STATUS.READ_ONLY);
  const date = format(message.dateTime, 'dd/MM/yyyy');
  const time = format(message.dateTime, 'hh:mm a');

  const handleUpdate = () => {
    onUpdate(message);
  };

  const handleCancel = () => {
    setStatus(STATUS.READ_ONLY);
  };

  const menuOptions = [
    { label: 'Edit', action: () => setStatus(STATUS.EDITING) },
    { label: 'Delete', action: () => onDelete(message.id) },
  ];

  return (
    <StyledCard className={className} variant="outlined" focus={status === STATUS.EDITING}>
      <Header>
        <Flexbox>
          <Avatar src={user.avatar} />
          <Title>{user.name}</Title>
        </Flexbox>
        <Flexbox>
          <Date>{date}</Date>
          <Time>{time}</Time>
          <ActionsMenu options={menuOptions} />
        </Flexbox>
      </Header>
      <MessageView status={status} message={message.content} />
      {status === STATUS.EDITING && (
        <CardActions>
          <OutlinedButton onClick={handleCancel}>Cancel</OutlinedButton>
          <Button onClick={handleUpdate}>Update</Button>
        </CardActions>
      )}
    </StyledCard>
  );
};

UserMessage.propTypes = {
  className: PropTypes.string,
  user: PropTypes.object.isRequired,
  message: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

UserMessage.defaultProps = {
  className: null,
};
