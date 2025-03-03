import React, { createContext, useContext } from 'react';

const APIContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const ApiProvider = ({ children, api }) => (
  <APIContext.Provider value={api}>{children}</APIContext.Provider>
);

export const useApiContext = () => useContext(APIContext);
