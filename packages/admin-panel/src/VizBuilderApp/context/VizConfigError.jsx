import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const VizConfigErrorContext = createContext(null);

export const VizConfigErrorProvider = ({ children }) => {
  const [dataError, setDataError] = useState(null);
  const [presentationError, setPresentationError] = useState(null);
  const hasDataError = dataError !== null;
  const hasPresentationError = presentationError !== null;
  const hasError = hasDataError || hasPresentationError;

  return (
    <VizConfigErrorContext.Provider
      value={{
        hasDataError,
        setDataError,
        hasPresentationError,
        setPresentationError,
        hasError,
      }}
    >
      {children}
    </VizConfigErrorContext.Provider>
  );
};

export const useVizConfigErrorContext = () => useContext(VizConfigErrorContext);

VizConfigErrorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
