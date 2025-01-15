import generateUUID from 'bson-objectid';

/**
 * @param {string} originalFileName
 * @returns {string} unique file name
 *
 * This function is used to generate a unique file name for a survey file upload question. It is used by DataTrak and eventually will be used by MediTrak app
 */
export const getUniqueSurveyQuestionFileName = originalFileName => {
  return `${generateUUID()}_${originalFileName}`;
};
