import { Input, Typography } from '@material-ui/core';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import { Form, IconButton } from '@tupaia/ui-components';
import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.article`
  block-size: 100%;
  background-color: oklch(97% 0 0);
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0.625rem;
`;

const MessageList = styled.div``;

const ChatInput = styled(Form)`
  display: grid;
  grid-template-rows: auto auto;
`;

const Textarea = styled(Input).attrs({
  autoComplete: 'none',
  id: 'user-message',
  margin: 'none',
  maxRows: 20,
  minRows: 3,
  multiline: true,
  name: 'user-message',
  required: true,
  variant: 'outlined',
})`
  padding-block: 0.625rem;
  padding-inline: 1rem;
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const UndoButton = styled(IconButton)``;

const SubmitButton = styled(IconButton).attrs({ type: 'submit' })``;

export const PresentationConfigAssistant = () => {
  const [message, setMessage] = useState(null);

  return (
    <Wrapper>
      <MessageList />
      <ChatInput>
        <Textarea
          placeholder="Type any changes you’d like to make to the chart here…"
          value={message}
        />
        <ButtonBar>
          <UndoButton>
            <UndoRoundedIcon />
            <Typography variant="srOnly">Undo</Typography>
          </UndoButton>
          <SubmitButton>
            <ArrowUpwardRoundedIcon />
            <Typography variant="srOnly">Submit</Typography>
          </SubmitButton>
        </ButtonBar>
      </ChatInput>
    </Wrapper>
  );
};
