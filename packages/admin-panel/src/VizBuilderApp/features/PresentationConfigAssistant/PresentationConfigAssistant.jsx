import { Typography } from '@material-ui/core';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { Form, IconButton, Input } from '@tupaia/ui-components';

import { usePromptMessageQuery } from '../../api';

const Wrapper = styled.article`
  block-size: 100%;
  background-color: oklch(97% 0 0);
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0.625rem;
`;

const MessageList = styled.div``;

const ChatForm = styled(Form)`
  display: grid;
  grid-template-rows: auto auto;
`;

const Textarea = styled(Input).attrs({
  autoComplete: 'none',
  id: 'userMessage',
  margin: 'none',
  maxRows: 12,
  minRows: 3,
  multiline: true,
  name: 'userMessage',
  required: true,
  variant: 'outlined',
})`
  &.MuiInputBase-root {
    background: white;
    padding-block: 0.75rem;
    padding-inline: 1rem;
  }
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const UndoButton = styled(IconButton)``;

const SubmitButton = styled(IconButton).attrs({ type: 'submit' })``;

export const PresentationConfigAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState(null);
  const formContext = useForm({
    defaultValues: { userMessage: null },
  });

  const { data: completion } = usePromptMessageQuery(messages, { onSuccess: formContext.reset });

  const onChange = console.log;
  const onSubmit = console.log;

  return (
    <Wrapper>
      <MessageList />
      <ChatForm formContext={formContext} onSubmit={onSubmit}>
        <Textarea
          id="userMessage"
          name="userMessage"
          onChange={onChange}
          placeholder="Type any changes you’d like to make to the chart here…"
          value={userMessage}
        />
        <ButtonBar>
          <UndoButton disabled>
            <UndoRoundedIcon />
            <Typography variant="srOnly">Undo</Typography>
          </UndoButton>
          <SubmitButton>
            <ArrowUpwardRoundedIcon />
            <Typography variant="srOnly">Submit</Typography>
          </SubmitButton>
        </ButtonBar>
      </ChatForm>
    </Wrapper>
  );
};
