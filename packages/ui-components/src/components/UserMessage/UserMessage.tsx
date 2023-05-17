/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useRef, useEffect, useState, ReactElement } from 'react';
import styled from 'styled-components';
import { Button, OutlinedButton } from '../Button';
import { TextField } from '../Inputs';
import { Card } from '../Card';
import { ActionsMenu } from '../ActionsMenu';
import { FlexEnd } from '../Layout';

const STATUS = {
  READ_ONLY: 'readOnly',
  LOADING: 'loading',
  EDITING: 'editing',
};

const TextareaField = styled(TextField)`
  margin: 0;

  .MuiInputBase-input {
    padding: 1.25rem 1.25rem 1.5rem;
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

type Message = {
  id: string;
  content: string;
};

interface MessageViewProps {
  status: string;
  message: Message;
}

const MessageView = ({ status, message }: MessageViewProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === STATUS.EDITING) {
      const input = inputRef?.current;
      const inputLength = input?.value?.length || 0;
      input?.setSelectionRange(inputLength, inputLength);
      input?.focus();
    }
  }, [status, inputRef]);

  const readOnly = status !== STATUS.EDITING;
  return (
    <TextareaField
      inputRef={inputRef}
      name={`message-${message.id}`}
      placeholder="Add a message..."
      multiline
      defaultValue={message.content}
      InputProps={{
        readOnly,
      }}
    />
  );
};

const StyledCard = styled(({ focus, ...props }) => <Card {...props} />)`
  box-shadow: ${props => (props.focus ? `0 0 6px ${props.theme.palette.secondary.light}` : 'none')};
`;

const CardActions = styled(FlexEnd)`
  padding: 1.25rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

interface UserMessageProps {
  Header: ReactElement;
  Footer: ReactElement;
  message: Message;
  onUpdate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  className?: string;
}

export const UserMessage = ({
  Header,
  Footer,
  message,
  onUpdate,
  onDelete,
  className,
}: UserMessageProps) => {
  const [status, setStatus] = useState(STATUS.READ_ONLY);

  const handleUpdate = async () => {
    setStatus(STATUS.LOADING);
    await onUpdate(message.id);
    setStatus(STATUS.READ_ONLY);
  };

  const menuOptions = [
    { label: 'Edit', action: () => setStatus(STATUS.EDITING) },
    { label: 'Delete', action: () => onDelete(message.id) },
  ];

  return (
    <StyledCard className={className} variant="outlined" focus={status === STATUS.EDITING}>
      {React.cloneElement(Header, { ActionsMenu: <ActionsMenu options={menuOptions} /> })}
      <MessageView status={status} message={message} />
      {Footer}
      {status !== STATUS.READ_ONLY && (
        <CardActions>
          <OutlinedButton
            onClick={() => setStatus(STATUS.READ_ONLY)}
            disabled={status === STATUS.LOADING}
          >
            Cancel
          </OutlinedButton>
          <Button onClick={handleUpdate} isLoading={status === STATUS.LOADING}>
            Update
          </Button>
        </CardActions>
      )}
    </StyledCard>
  );
};
