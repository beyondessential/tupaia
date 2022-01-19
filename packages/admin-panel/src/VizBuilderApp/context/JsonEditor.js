/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const JsonEditorContext = createContext(null);

export const JsonEditorProvider = ({ children }) => {
  const [jsonToggleEnabled, setJsonToggleEnabled] = useState(false);

  return (
    <JsonEditorContext.Provider value={{ jsonToggleEnabled, setJsonToggleEnabled }}>
      {children}
    </JsonEditorContext.Provider>
  );
};

export const useJsonEditor = () => useContext(JsonEditorContext);

JsonEditorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
