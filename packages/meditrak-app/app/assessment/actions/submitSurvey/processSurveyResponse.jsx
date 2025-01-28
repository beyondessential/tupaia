import generateUUID from 'bson-objectid';
import moment from 'moment';
import RNFS from 'react-native-fs';

import {
  getFileInDocumentsPath,
  getFilenameFromUri,
  imageDataIsFileName,
} from '../../../utilities';
import { addRecentEntityId } from '../../helpers';
import { getAnswers } from '../../selectors';

const processAnswerForDatabase = async (database, questionId, type, answer) => {
  let processedAnswer = answer;
  if (type === 'Photo' && imageDataIsFileName(answer)) {
    const localFilename = getFileInDocumentsPath(answer);
    const fileId = generateUUID().toString();

    const imageData = await RNFS.readFile(localFilename, 'base64');
    database.saveImage(fileId, imageData);
    processedAnswer = fileId;
  }

  if (type === 'File' && answer) {
    const fileId = generateUUID().toString();
    const uniqueFileName = `${fileId}_${getFilenameFromUri(answer)}`;
    database.saveFile(fileId, uniqueFileName, answer);
    processedAnswer = uniqueFileName;
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

export const processSurveyResponse = async (getState, database, userId, questions) => {
  // Fields to be used in the survey response
  const responseFields = {};
  // Process answers and save the response in the database
  const answersToSubmit = [];

  const answers = getAnswers(getState());
  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    // Save any entities used in the recent list
    if (['PrimaryEntity', 'Entity'].includes(question.type)) {
      const { filter } = question.config.entity;
      const entityTypes = filter?.type || [];
      addRecentEntityId(
        database,
        userId,
        entityTypes,
        getState().country.selectedCountryId,
        answer,
      );
    }

    // Handle special question types
    switch (question.type) {
      case 'SubmissionDate':
      case 'DateOfData':
        responseFields.dataTime = moment(answer).toISOString();
        break;
      case 'PrimaryEntity': {
        responseFields.entityId = answer;
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
