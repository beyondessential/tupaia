import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { usePromptMessageQuery } from '../../api';
import { Chat } from '../../components/Chat';
import { usePreviewDataContext } from '../../context';
import { usePresentationConfigAssistantContext } from '../../context/PresentationConfigAssistant';

const Wrapper = styled.article`
  z-index: 99999;
  block-size: 100%;
  background-color: oklch(97% 0 0);
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0.625rem;
`;

export const PresentationConfigAssistant = ({
  visualisationCode,
  dataStructure,
  onAssistantResponse,
}) => {
  const [currentMessage, setCurrentMessage] = useState(null);
  const { getVisualisationMessages, addVisualisationMessage } =
    usePresentationConfigAssistantContext();

  const messages = getVisualisationMessages(visualisationCode);
  const { data: completion } = usePromptMessageQuery(currentMessage, dataStructure, {
    enabled: !!currentMessage,
  });

  useEffect(() => {
    if (completion) {
      onAssistantResponse(completion);
      setCurrentMessage(null);
    }
  }, [completion]);

  const onSubmit = userMessage => {
    if (userMessage) {
      setCurrentMessage(userMessage.text);
      addVisualisationMessage(visualisationCode, userMessage);
    }
  };

  return (
    <Wrapper>
      <Chat messages={messages} onSendMessage={onSubmit} />
    </Wrapper>
  );
};
