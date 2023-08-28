/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SurveyParams } from '../../types.ts';
import { useSurveyScreenComponents } from '../../api/queries';

type SurveyFormContextType = {
  formData: { [key: string]: any };
  setFormData: (data: { [key: string]: any }) => void;
  activeScreen: any;
  isLast: boolean;
  numberOfScreens: number;
  screenNumber: number;
};

const SurveyFormContext = createContext({} as SurveyFormContextType);

export const SurveyContext = ({ children }) => {
  const [formData, setFormData] = useState({});
  const { surveyCode, ...params } = useParams<SurveyParams>();
  const screenNumber = parseInt(params.screenNumber!, 10);
  const { data: surveyScreenComponents } = useSurveyScreenComponents(surveyCode);

  const activeScreen = surveyScreenComponents[screenNumber!];
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = screenNumber === numberOfScreens;

  return (
    <SurveyFormContext.Provider
      value={{ formData, setFormData, activeScreen, isLast, numberOfScreens, screenNumber }}
    >
      {children}
    </SurveyFormContext.Provider>
  );
};

export const useSurveyForm = () => useContext(SurveyFormContext);
