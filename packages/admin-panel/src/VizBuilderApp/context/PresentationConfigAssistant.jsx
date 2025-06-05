import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const PresentationConfigAssistantContext = createContext(null);

export const PresentationConfigAssistantProvider = ({ children }) => {
  const [messages, setMessages] = useState({});

  const addVisualisationMessage = (code, message) => {
    setMessages(prev => ({ ...prev, [code]: { messages: [...(prev[code]?.messages || []), message] } }));
  };

  const getVisualisationMessages = code => {
    return messages[code]?.messages || [];
  };

  return (
    <PresentationConfigAssistantContext.Provider
      value={{
        getVisualisationMessages,
        addVisualisationMessage,
      }}
    >
      {children}
    </PresentationConfigAssistantContext.Provider>
  );
};

export const usePresentationConfigAssistantContext = () =>
  useContext(PresentationConfigAssistantContext);

PresentationConfigAssistantProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
