import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Divider, TextareaAutosize } from '@material-ui/core';
import styled from 'styled-components';

import { Button } from '../Button';

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

export const MessageView = ({ userMessageId, edit, message, onCancel, onUpdate }) => {
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
