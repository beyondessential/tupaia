import React, { useState, useRef, useEffect } from 'react';
import { Typography, Input } from '@material-ui/core';
import styled, { keyframes } from 'styled-components';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

import { IconButton } from './IconButton';
import { TypingIndicator } from './TypingIndicator';

// Types
interface Message {
  id: number | string;
  text: string;
  isOwn: boolean;
}

interface ChatProps {
  startingMessageText?: string;
  messages?: Message[];
  onSendMessage?: (message: Message) => void;
  height?: number;
  width?: number;
  isProcessingMessage?: boolean;
}

interface MessageWrapperProps {
  isOwn: boolean;
}

interface MessageContentProps {
  isOwn: boolean;
  bold: boolean;
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
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Roboto', 'Arial', sans-serif;
`;

const MessagesArea = styled.div<ThemeProps>`
  flex: 1;
  overflow-y: auto;
  background: ${props => props.theme.palette.background.grey};
  display: flex;
  flex-direction: column;
`;

const MessageWrapper = styled.div<MessageWrapperProps>`
  display: flex;
  align-items: flex-end;
  animation: ${fadeIn} 0.3s --ease-out-quad;
  flex-direction: ${props => (props.isOwn ? 'row-reverse' : 'row')};
  margin: 0 0.5rem;
`;

const MessageContent = styled.div<MessageContentProps>`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.isOwn ? 'flex-end' : 'flex-start')};
  ${props => (props.bold ? 'font-weight: 600;' : '')};
  width: 80%;
`;

const BaseMessageBubble = styled.p`
  color: inherit;
  padding: 12px 16px;
  word-wrap: break-word;
  font-size: 0.875rem;
  line-height: 1.4;

  p {
    margin: 0;
  }
`;

// Exactly similar to BaseMessageBubble but just to make it clear that it's a system message
const SystemMessageBubble = styled(BaseMessageBubble)``;

const UserMessageBubble = styled(BaseMessageBubble)`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  .MuiInputBase-input::placeholder {
    color: ${props => props.theme.palette.text.hint};
    opacity: 1;
  }
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: space-between;
  background: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

// TODO: Add undo button functionality
const UndoButton = styled(IconButton)`
  visibility: hidden;
`;

const SubmitButton = styled(IconButton).attrs({ type: 'submit' })<ThemeProps>`
  width: 36px;
  height: 32px;
  background: ${props => props.theme.palette.primary.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
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

interface MessageProps {
  message: Message;
  bold?: boolean;
}

const Message = ({ message, bold = false }: MessageProps) => (
  <MessageWrapper key={message.id} isOwn={message.isOwn}>
    <MessageContent isOwn={message.isOwn} bold={bold}>
      {message.isOwn ? (
        <UserMessageBubble>{message.text}</UserMessageBubble>
      ) : (
        <SystemMessageBubble>{message.text}</SystemMessageBubble>
      )}
    </MessageContent>
  </MessageWrapper>
);

// Main Chat Component
export const Chat: React.FC<ChatProps> = ({
  startingMessageText,
  messages = [],
  onSendMessage,
  height = 600,
  width = 310,
  isProcessingMessage = false,
}) => {
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  let startingMessage: Message | null = null;
  if (startingMessageText) {
    startingMessage = {
      id: 'starting-message',
      text: startingMessageText,
      isOwn: false,
    };
  }

  return (
    <ChatContainer style={{ width, height }}>
      <MessagesArea>
        {startingMessage && <Message message={startingMessage} bold={true} />}
        {messages.map((message: Message) => (
          <Message message={message} />
        ))}
        {isProcessingMessage && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </MessagesArea>

      <Textarea
        id="userMessage"
        name="userMessage"
        onChange={handleInputChange}
        placeholder={
          messages.length === 0
            ? 'Type any changes you’d like to make to the chart here…'
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
