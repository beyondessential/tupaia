import React, { useState } from 'react';
import { Typography, Input } from '@material-ui/core';
import styled, { keyframes } from 'styled-components';
import { IconButton } from '@tupaia/ui-components';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

// Keyframe animations
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

// Styled Components
const ChatContainer = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Roboto', 'Arial', sans-serif;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: ${props => props.theme.palette.background.grey};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  animation: ${fadeIn} 0.3s ease-in;
  flex-direction: ${props => (props.isOwn ? 'row-reverse' : 'row')};
`;

const MessageContent = styled.div`
  max-width: 70%;
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.isOwn ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div`
  background: ${props => (props.isOwn ? 'white' : props.theme.palette.background.default)};
  color: ${props => (props.isOwn ? 'inherit' : 'inherit')};
  padding: 12px 16px;
  ${props => (props.isOwn ? 'border-radius: 8px;' : '')};
  ${props => (props.isOwn ? 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)' : '')};
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;

  p {
    margin: 0;
  }
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
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: space-between;
  background: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const UndoButton = styled(IconButton)``;

const SubmitButton = styled(IconButton).attrs({ type: 'submit' })`
  width: 44px;
  height: 44px;
  border: none;
  background: ${props => props.theme.palette.primary.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${props => props.theme.palette.primaryDark};
  }
`;

// Main Chat Component
export const Chat = ({ messages = [], onSendMessage, height = 600, width = 300 }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now(),
        text: input,
        isOwn: true,
      };

      if (onSendMessage) {
        onSendMessage(newMessage);
      }

      setInput('');
    }
  };

  return (
    <ChatContainer width={width} height={height}>
      <MessagesArea>
        {messages.map(message => (
          <Message key={message.id} isOwn={message.isOwn}>
            <MessageContent isOwn={message.isOwn}>
              <MessageBubble isOwn={message.isOwn}>
                <p>{message.text}</p>
              </MessageBubble>
            </MessageContent>
          </Message>
        ))}
      </MessagesArea>

      <Textarea
        id="userMessage"
        name="userMessage"
        onChange={e => setInput(e.target.value)}
        placeholder="Type any changes you’d like to make to the chart here…"
        value={input}
        disableUnderline={true}
      />
      <ButtonBar>
        <UndoButton disabled>
          <UndoRoundedIcon />
          <Typography variant="srOnly">Undo</Typography>
        </UndoButton>
        <SubmitButton>
          <ArrowUpwardRoundedIcon onClick={handleSend} />
          <Typography variant="srOnly">Submit</Typography>
        </SubmitButton>
      </ButtonBar>
    </ChatContainer>
  );
};
