/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { humanFriendlyModelName } from '@tupaia/utils';

const ResourcePageContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const ResourcePageContextProvider = ({ initialModel, children }) => {
  const [model, setModel] = useState(initialModel);
  const value = {
    model,
    setModel,
    humanFriendlyModelName: model ? humanFriendlyModelName(model) : 'Unknown Model',
    humanFriendlyModelNames: model ? humanFriendlyModelName(model, true) : 'Unknown Model',
  };

  return <ResourcePageContext.Provider value={value}>{children}</ResourcePageContext.Provider>;
};

ResourcePageContextProvider.propTypes = {
  initialModel: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export const useResourcePageContext = () => useContext(ResourcePageContext);
