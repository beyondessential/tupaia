/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useContext, useState } from 'react';

const SurveyFormContext = createContext({});

export const SurveyFormProvider = ({ children }) => {
  const [formData, setFormData] = useState(false);

  return (
    <SurveyFormContext.Provider value={{ formData, setFormData }}>
      {children}
    </SurveyFormContext.Provider>
  );
};

export const useSurveyForm = () => useContext(SurveyFormContext);
