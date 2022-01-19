/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const EditPanelContext = createContext(null);

export const EditPanelProvider = ({ children }) => {
  const [jsonToggleEnabled, setJsonToggleEnabled] = useState(false);

  return (
    <EditPanelContext.Provider value={{ jsonToggleEnabled, setJsonToggleEnabled }}>
      {children}
    </EditPanelContext.Provider>
  );
};

export const useEditPanel = () => useContext(EditPanelContext);

EditPanelProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
