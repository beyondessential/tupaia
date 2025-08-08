import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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

const MessageView = ({ status, message }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (status === STATUS.EDITING) {
      const input = inputRef.current;
      const { length } = input.value;
      input.setSelectionRange(length, length);
      input.focus();
    }
  }, [status, inputRef]);

  return (
    <TextareaField
      inputRef={inputRef}
      name={`message-${message.id}`}
      placeholder="Add a message..."
      multiline
      defaultValue={message.content}
      InputProps={{
        readOnly: status !== STATUS.EDITING,
      }}
    />
  );
};

MessageView.propTypes = {
  status: PropTypes.string.isRequired,
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string,
  }),
};

const StyledCard = styled(({ focus, ...props }) => <Card {...props} />)`
  box-shadow: ${props => (props.focus ? `0 0 6px ${props.theme.palette.secondary.light}` : 'none')};
`;

const CardActions = styled(FlexEnd)`
  padding: 1.25rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const UserMessage = ({ Header, Footer, message, onUpdate, onDelete, className }) => {
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

UserMessage.propTypes = {
  Header: PropTypes.any.isRequired,
  Footer: PropTypes.any,
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string,
  }),
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

UserMessage.defaultProps = {
  Footer: null,
  className: null,
};
