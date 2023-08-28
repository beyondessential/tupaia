/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useContext, useState } from 'react';

type SurveyFormContextType = {
  formData: { [key: string]: any };
  setFormData: (data: { [key: string]: any }) => void;
};

const SurveyFormContext = createContext({} as SurveyFormContextType);

export const SurveyContext = ({ children }) => {
  const [formData, setFormData] = useState({});

  return (
    <SurveyFormContext.Provider value={{ formData, setFormData }}>
      {children}
    </SurveyFormContext.Provider>
  );
};

export const useSurveyForm = () => useContext(SurveyFormContext);
