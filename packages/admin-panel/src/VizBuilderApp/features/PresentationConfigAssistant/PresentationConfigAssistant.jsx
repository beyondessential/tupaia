import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Chat } from '@tupaia/ui-components';

import { usePresentationOptionsPromptQuery } from '../../api';
import { usePresentationConfigAssistantContext } from '../../context/PresentationConfigAssistant';

const Wrapper = styled.article`
  z-index: 99999;
  block-size: 100%;
  background-color: oklch(97% 0 0);
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0.625rem;
`;

export const PresentationConfigAssistant = ({ dataStructure, onAssistantResponse }) => {
  const [currentMessage, setCurrentMessage] = useState(null);
  const { messages, addVisualisationMessage } = usePresentationConfigAssistantContext();

  const { data: completion, isFetching } = usePresentationOptionsPromptQuery(
    currentMessage,
    dataStructure,
    {
      enabled: !!currentMessage,
    },
  );

  useEffect(() => {
    if (completion) {
      onAssistantResponse(completion);
      setCurrentMessage(null);
    }
  }, [completion, onAssistantResponse]);

  const onSubmit = userMessage => {
    if (userMessage) {
      setCurrentMessage(userMessage.text);
      addVisualisationMessage(userMessage);
    }
  };

  return (
    <Wrapper>
      <Chat
        messages={messages}
        onSendMessage={onSubmit}
        isProcessingMessage={isFetching}
        startingMessageText="Are there any chart presentation changes you’d like to make?"
      />
    </Wrapper>
  );
};
