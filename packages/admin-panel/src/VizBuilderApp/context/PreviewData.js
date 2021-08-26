/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const PreviewDataContext = createContext(null);

export const PreviewDataProvider = ({ children }) => {
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const [showData, setShowData] = useState(false);

  return (
    <PreviewDataContext.Provider value={{ fetchEnabled, setFetchEnabled, showData, setShowData }}>
      {children}
    </PreviewDataContext.Provider>
  );
};

PreviewDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
