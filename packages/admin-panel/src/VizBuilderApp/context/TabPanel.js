/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const UseTabPanelContext = createContext(null);

export const TabPanelProvider = ({ children }) => {
  const [jsonToggleEnabled, setJsonToggleEnabled] = useState(false);

  return (
    <UseTabPanelContext.Provider value={{ jsonToggleEnabled, setJsonToggleEnabled }}>
      {children}
    </UseTabPanelContext.Provider>
  );
};

export const useTabPanel = () => useContext(UseTabPanelContext);

TabPanelProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
