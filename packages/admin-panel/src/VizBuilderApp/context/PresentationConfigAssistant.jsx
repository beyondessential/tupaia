import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const PresentationConfigAssistantContext = createContext(null);

export const PresentationConfigAssistantProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: `Are there any chart presentation changes you'd like to make?`,
      isOwn: false,
    },
  ]);

  const addVisualisationMessage = message => {
    setMessages([...messages, message]);
  };

  return (
    <PresentationConfigAssistantContext.Provider
      value={{
        messages,
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
