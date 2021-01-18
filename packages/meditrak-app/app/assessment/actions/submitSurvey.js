/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import generateUUID from 'bson-objectid';
import moment from 'moment';
import RNFS from 'react-native-fs';

import { synchroniseDatabase } from '../../sync';
import { getFileInDocumentsPath, imageDataIsFileName, generateMongoId } from '../../utilities';
import { getCurrentUserLocation, stopWatchingUserLocation } from '../../utilities/userLocation';
import { SURVEY_SUBMIT, SURVEY_SUBMIT_SUCCESS } from '../constants';
import { addMessage } from '../../messages';
import { goBack } from '../../navigation';
import { getAnswers, getScreens, getValidQuestions } from '../selectors';
import { changeAnswer, selectSurvey, validateScreen } from './actions';
import {
  doesScreenHaveValidationErrors,
  getDefaultEntitySettingKey,
  getEntityCreationQuestions,
  getOptionCreationAutocompleteQuestions,
} from '../helpers';

const getValidatedScreens = (dispatch, getState) => {
  const screens = getScreens(getState());
  screens.forEach((screen, screenIndex) => {
    dispatch(validateScreen(screenIndex));
  });

  return getScreens(getState()); // Re-fetch state now validation is added
};

const processAnswerForDatabase = async (database, questionId, type, answer) => {
  let processedAnswer = answer;
  if (type === 'Photo' && imageDataIsFileName(answer)) {
    const localFilename = getFileInDocumentsPath(answer);
    const fileId = generateUUID().toString();

    const imageData = await RNFS.readFile(localFilename, 'base64');
    database.saveImage(fileId, imageData);
    processedAnswer = fileId;
  }

  // Some question types work off raw data, but display and store a processed version.
  // E.g. DaysSince questions store the raw date during the survey,
  // but need to save the days since that raw date.
  if (answer && answer.processed) {
    processedAnswer = answer.processed;
  }
  processedAnswer =
    typeof processedAnswer === 'string' ? processedAnswer : JSON.stringify(processedAnswer);

  return {
    questionId,
    type,
    body: processedAnswer,
  };
};

const buildEntity = async (state, database, fields, entityId, answers) => {
  const entity = { id: entityId };
  Object.entries(fields).forEach(([fieldName, value]) => {
    // Value is not defined, skip
    if (value === undefined) {
      return;
    }

    const fieldValue = typeof value === 'string' ? value : answers[value.questionId];
    if (fieldName === 'parentId') {
      entity.parent = database.findOne('Entity', fieldValue, 'id');
    } else {
      entity[fieldName] = fieldValue;
    }
  });

  const getSelectedCountry = () => database.getCountry(state.country.selectedCountryId);
  if (!entity.countryCode) {
    entity.countryCode = getSelectedCountry().code;
  }
  if (!entity.parent) {
    const country = getSelectedCountry();
    entity.parent = country.entity(database);
  }
  if (!entity.code) {
    entity.code = entityId;
  }

  return entity;
};

const processQuestions = async (dispatch, getState, database, userId, questions) => {
  // Fields to be used in the survey response
  const responseFields = {};
  // Process answers and save the response in the database
  const answersToSubmit = [];

  const answers = getAnswers(getState());
  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) {
      continue;
    }

    // Handle special question types
    switch (question.type) {
      case 'SubmissionDate':
        responseFields.submissionTime = moment(answer).toISOString();
        break;
      case 'PrimaryEntity': {
        const { type } = question.config.entity;
        responseFields.entityId = answer;
        database.setSetting(
          getDefaultEntitySettingKey(userId, type, getState().country.selectedCountryId),
          answer,
        );
        break;
      }
      default:
        answersToSubmit.push(
          await processAnswerForDatabase(database, question.id, question.type, answer),
        );
        break;
    }
  }

  return { responseFields, answersToSubmit };
};

const buildOption = (database, optionSetId, value) => {
  const optionSet = database.getOptionSetById(optionSetId);
  const largestSortOrder = optionSet.getLargestSortOrder();
  return {
    id: generateMongoId(),
    value,
    sortOrder: largestSortOrder + 1,
    optionSet,
  };
};

const createOptions = (getState, database, questions) => {
  const autocompleteQuestions = getOptionCreationAutocompleteQuestions(questions);
  const answers = getAnswers(getState());
  const createdOptions = [];
  autocompleteQuestions
    .filter(({ id: questionId }) => answers[questionId] !== undefined)
    .forEach(question => {
      const { id: questionId, optionSetId } = question;
      const answer = answers[questionId];
      const optionSet = database.getOptionSetById(optionSetId);
      // Check if the selected option isn't an existing option in the option set
      if (!optionSet.doesOptionValueExist(answer)) {
        createdOptions.push(buildOption(database, optionSetId, answer));
      }
    });

  return createdOptions;
};

const createEntities = async (dispatch, getState, database, questions) => {
  const entityCreationQuestions = getEntityCreationQuestions(questions);
  const answers = getAnswers(getState());
  const newEntities = [];
  await Promise.all(
    entityCreationQuestions.map(async question => {
      const { code, name, parentId, type } = question.config.entity;
      const answer = answers[question.id];
      const fields = { id: answer, code, name, parentId, type: type[0] };

      const entity = await buildEntity(getState(), database, fields, answer, answers);
      newEntities.push(entity);
      dispatch(changeAnswer(question.id, entity.id));
    }),
  );

  return newEntities;
};

export const submitSurvey = (surveyId, userId, startTime, questions, shouldRepeat) => async (
  dispatch,
  getState,
  { database, analytics },
) => {
  const validatedScreens = getValidatedScreens(dispatch, getState);
  if (validatedScreens.some(screen => doesScreenHaveValidationErrors(screen))) {
    return; // Early return, do not submit if there are validation errors
  }
  dispatch({ type: SURVEY_SUBMIT });

  // Skip duplicate survey responses.
  const existingSurveyResponses = database.findSurveyResponses({ surveyId, startTime });

  // Only save the survey if it isn't a duplicate.
  if (existingSurveyResponses.length === 0) {
    const validQuestions = getValidQuestions(getState(), questions, validatedScreens);
    const newEntities = await createEntities(dispatch, getState, database, validQuestions);
    const newOptions = createOptions(getState, database, validQuestions);
    const { responseFields, answersToSubmit } = await processQuestions(
      dispatch,
      getState,
      database,
      userId,
      validQuestions,
    );
    const endTime = new Date().toISOString();
    const location = await getCurrentUserLocation(getState(), 1000);
    const response = {
      surveyId,
      assessorName: database.getCurrentUser().name,
      startTime,
      userId,
      metadata: JSON.stringify({ location }),
      endTime,
      submissionTime: endTime, // Use endTime as default. May be changed by question processing above
      ...responseFields,
    };

    database.saveSurveyResponse(response, answersToSubmit, {
      entityObjects: newEntities,
      optionObjects: newOptions,
    });
    analytics.trackEvent('Submit Survey', response);
  }

  dispatch(synchroniseDatabase());
  dispatch({ type: SURVEY_SUBMIT_SUCCESS });
  dispatch(addMessage('submit_survey', 'Survey submitted'));

  if (shouldRepeat) {
    dispatch(selectSurvey(surveyId, true));
  } else {
    dispatch(stopWatchingUserLocation());
    dispatch(goBack(false));
  }
};
