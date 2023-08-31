/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sortBy } from 'lodash';
import { SurveyParams, SurveyScreenComponent } from '../../types';
import { useSurveyScreenComponents } from '../../api/queries';

const convertNumberToLetter = (number: number) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  if (number > 25) {
    // occasionally there are more than 26 questions on a screen, so we then start at aa, ab....
    const firstLetter = alphabet[Math.floor(number / 26) - 1];
    const secondLetter = alphabet[number % 26];
    return `${firstLetter}${secondLetter}`;
  }
  return alphabet[number];
};

type SurveyFormContextType = {
  formData: { [key: string]: any };
  setFormData: (data: { [key: string]: any }) => void;
  activeScreen: SurveyScreenComponent[];
  isLast: boolean;
  numberOfScreens: number;
  screenNumber: number;
  screenHeader?: string;
  displayQuestions: SurveyScreenComponent[];
};

const SurveyFormContext = createContext({} as SurveyFormContextType);

export const SurveyContext = ({ children }) => {
  const [formData, setFormData] = useState({});
  const { surveyCode, ...params } = useParams<SurveyParams>();
  const screenNumber = parseInt(params.screenNumber!, 10);
  const { data: surveyScreenComponents } = useSurveyScreenComponents(surveyCode);

  const activeScreen = sortBy(surveyScreenComponents[screenNumber!], 'componentNumber');
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = screenNumber === numberOfScreens;

  const nonInstructionQuestions = activeScreen.filter(
    question => question.questionType !== 'Instruction',
  );
  // If the first question is an instruction, don't render it since we always just
  // show the text of first questions as the heading. Format the questions with a question number to display
  const displayQuestions = (activeScreen.length && activeScreen[0].questionType === 'Instruction'
    ? activeScreen.slice(1)
    : activeScreen
  ).map(question => {
    const questionNumber = nonInstructionQuestions.findIndex(
      nonInstructionQuestion => question.questionId === nonInstructionQuestion.questionId,
    );
    if (questionNumber === -1) return question;
    return {
      ...question,
      questionNumber: `${screenNumber}${convertNumberToLetter(questionNumber)}.`,
    };
  });

  return (
    <SurveyFormContext.Provider
      value={{
        formData,
        setFormData,
        activeScreen,
        isLast,
        numberOfScreens,
        screenNumber,
        displayQuestions,
        screenHeader: activeScreen.length ? activeScreen[0].questionText : '',
      }}
    >
      {children}
    </SurveyFormContext.Provider>
  );
};

export const useSurveyForm = () => useContext(SurveyFormContext);
