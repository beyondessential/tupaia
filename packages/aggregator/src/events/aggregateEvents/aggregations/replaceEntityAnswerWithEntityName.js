/**
 * Tupaia Config Server
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd
 */

/**
 *
 * Replace entity id data value with entity name
 *
 * @param {*} events
 * @param {questionCodes: String[], answerTranslation} aggregationConfig
 *
 */
export const replaceEntityAnswerWithEntityName = (events, aggregationConfig) => {
  const { questionCodes, answerTranslation } = aggregationConfig;
  return events.map(event => {
    const updatedDataValues = questionCodes.reduce((acc, questionCode) => {
      if (event.dataValues[questionCode]) {
        const entityName = answerTranslation[questionCode][event.event];
        if (entityName) return { ...acc, [questionCode]: entityName };
      }
      return acc;
    }, {});

    return { ...event, dataValues: { ...event.dataValues, ...updatedDataValues } };
  });
};
