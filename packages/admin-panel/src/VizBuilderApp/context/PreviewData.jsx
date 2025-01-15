import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const PreviewDataContext = createContext(null);

export const PreviewDataProvider = ({ children }) => {
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const [showData, setShowData] = useState(false);
  const [jsonToggleEnabled, setJsonToggleEnabled] = useState(false);

  return (
    <PreviewDataContext.Provider
      value={{
        fetchEnabled,
        setFetchEnabled,
        showData,
        setShowData,
        jsonToggleEnabled,
        setJsonToggleEnabled,
      }}
    >
      {children}
    </PreviewDataContext.Provider>
  );
};

export const usePreviewDataContext = () => useContext(PreviewDataContext);

PreviewDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
