/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState, createContext, useContext } from 'react';

const fakeAuth = {
  isAuthenticated: false,
  signin(cb) {
    fakeAuth.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    fakeAuth.isAuthenticated = false;
    setTimeout(cb, 100);
  },
};

const authContext = createContext();

const exampleUser = {
  name: 'Catherine Bell',
  firstName: 'Catherine',
  email: 'catherine@beyondessential.com.au',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = cb => {
    return fakeAuth.signin(() => {
      setUser(exampleUser);
      cb();
    });
  };

  const logout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      cb();
    });
  };

  return (
    <authContext.Provider
      value={{
        user,
        login,
        logout,
        isError: false,
        isLoading: false,
        error: false,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
