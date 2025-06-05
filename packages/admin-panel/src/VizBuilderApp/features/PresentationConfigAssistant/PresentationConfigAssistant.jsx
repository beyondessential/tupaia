import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { usePromptMessageQuery } from '../../api';
import { Chat } from '../../components/Chat';
import { usePreviewDataContext } from '../../context';
import { usePresentationConfigAssistantContext } from '../../context/PresentationConfigAssistant';

const Wrapper = styled.article`
  z-index: 90000;
  block-size: 100%;
  background-color: oklch(97% 0 0);
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0.625rem;
`;

export const PresentationConfigAssistant = ({
  visualisationCode,
  dataStructure,
  setPresentationValue,
}) => {
  const { getVisualisationMessages, addVisualisationMessage } =
    usePresentationConfigAssistantContext();
  const { setFetchEnabled, setShowData } = usePreviewDataContext();

  const messages = getVisualisationMessages(visualisationCode);
  const { data: completion } = usePromptMessageQuery(
    messages[messages.length - 1]?.text,
    dataStructure,
  );

  useEffect(() => {
    console.log('completionnn', completion);
    if (completion) {
      if (completion.status_code === 'success') {
        setPresentationValue(completion.presentationConfig);
        setFetchEnabled(true);
        setShowData(true);
      }
      addVisualisationMessage(visualisationCode, {
        id: Date.now(),
        text: completion.message,
        isOwn: false,
      });
    }
  }, [completion]);

  const onSubmit = userMessage => {
    if (userMessage) {
      addVisualisationMessage(visualisationCode, userMessage);
    }
  };

  return (
    <Wrapper>
      <Chat messages={messages} onSendMessage={onSubmit} />
    </Wrapper>
  );
};
