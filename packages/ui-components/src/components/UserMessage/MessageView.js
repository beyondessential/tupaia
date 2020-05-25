import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

import { StyledButton, StyledDivider, StyledTextareaAutosize } from './styled';

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
