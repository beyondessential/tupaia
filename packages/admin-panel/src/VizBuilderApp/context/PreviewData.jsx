import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const PreviewDataContext = createContext(null);

export const PreviewDataProvider = ({ children }) => {
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showTransformStepAsJson, setShowTransformStepAsJson] = useState(false);
  const [showPresentationAsJson, setShowPresentationAsJson] = useState(false);

  return (
    <PreviewDataContext.Provider
      value={{
        fetchEnabled,
        setFetchEnabled,
        showData,
        setShowData,
        showTransformStepAsJson,
        setShowTransformStepAsJson,
        showPresentationAsJson,
        setShowPresentationAsJson,
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
