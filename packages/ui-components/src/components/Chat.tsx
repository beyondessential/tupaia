import React, { useState } from 'react';
import { Typography, Input } from '@material-ui/core';
import styled, { keyframes } from 'styled-components';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

import { IconButton } from './IconButton';
import { TypingIndicator } from './TypingIndicator';

// Types
interface Message {
  id: number;
  text: string;
  isOwn: boolean;
}

interface ChatProps {
  messages?: Message[];
  onSendMessage?: (message: Message) => void;
  height?: number;
  width?: number;
  isProcessingMessage?: boolean;
}

interface StyledProps {
  width: number;
  height: number;
}

interface MessageProps {
  isOwn: boolean;
}

interface MessageContentProps {
  isOwn: boolean;
  isFirst: boolean;
}

interface ThemeProps {
  theme: {
    palette: {
      background: {
        grey: string;
      };
      primary: {
        white: string;
        blue: string;
      };
      primaryDark: string;
    };
  };
}

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
const ChatContainer = styled.div<StyledProps>`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Roboto', 'Arial', sans-serif;
`;

const MessagesArea = styled.div<ThemeProps>`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: ${props => props.theme.palette.background.grey};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Message = styled.div<MessageProps>`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  animation: ${fadeIn} 0.3s ease-in;
  flex-direction: ${props => (props.isOwn ? 'row-reverse' : 'row')};
`;

const MessageContent = styled.div<MessageContentProps>`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.isOwn ? 'flex-end' : 'flex-start')};
  ${props => (props.isFirst ? 'font-weight: 600;' : '')};
`;

const MessageBubble = styled.div<MessageProps>`
  ${props => (props.isOwn ? 'background: white;' : '')};
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
  rowsMax: 12,
  rowsMin: 3,
  multiline: true,
  name: 'userMessage',
  required: true,
  variant: 'outlined',
})`
  &.MuiInputBase-root {
    overflow-y: auto;
    height: 60px;
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

const SubmitButton = styled(IconButton).attrs({ type: 'submit' })<ThemeProps>`
  width: 40px;
  height: 35px;
  border: none;
  background: ${props => props.theme.palette.primary.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 3px;
  border: 1px solid ${props => props.theme.palette.primary.blue};
  margin: 10px;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${props => props.theme.palette.primaryDark};
  }
`;

// Main Chat Component
export const Chat: React.FC<ChatProps> = ({
  messages = [],
  onSendMessage,
  height = 600,
  width = 310,
  isProcessingMessage = false,
}) => {
  const [input, setInput] = useState<string>('');

  const handleSend = (): void => {
    if (input.trim()) {
      const newMessage: Message = {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
  };

  return (
    <ChatContainer width={width} height={height}>
      <MessagesArea>
        {messages.map((message: Message, index: number) => (
          <Message key={message.id} isOwn={message.isOwn}>
            <MessageContent isOwn={message.isOwn} isFirst={index === 0}>
              <MessageBubble isOwn={message.isOwn}>
                <p>{message.text}</p>
              </MessageBubble>
            </MessageContent>
          </Message>
        ))}
        {isProcessingMessage && <TypingIndicator />}
      </MessagesArea>

      <Textarea
        id="userMessage"
        name="userMessage"
        onChange={handleInputChange}
        placeholder={
          messages.length === 0
            ? `Type any changes you'd like to make to the chart here…`
            : 'Reply here'
        }
        value={input}
        disableUnderline={true}
        onKeyDown={handleKeyDown}
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
