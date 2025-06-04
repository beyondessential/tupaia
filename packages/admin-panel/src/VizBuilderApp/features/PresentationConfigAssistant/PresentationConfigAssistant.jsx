import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { usePromptMessageQuery } from '../../api';
import { Chat } from '../../components/Chat';
import { usePreviewDataContext } from '../../context';

const Wrapper = styled.article`
  block-size: 100%;
  background-color: oklch(97% 0 0);
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0.625rem;
`;

export const PresentationConfigAssistant = ({ dataStructure, setPresentationValue }) => {
  const [messages, setMessages] = useState([]);
  const { setFetchEnabled, setShowData } = usePreviewDataContext();

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
      setMessages([...messages, { id: Date.now(), text: completion.message, isOwn: false }]);
    }
  }, [completion]);

  const onSubmit = userMessage => {
    if (userMessage) {
      setMessages([...messages, userMessage]);
    }
  };

  return (
    <Wrapper>
      <Chat messages={messages} onSendMessage={onSubmit} />
    </Wrapper>
  );
};
